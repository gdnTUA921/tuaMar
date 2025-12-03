from sqlalchemy import create_engine, text
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import re
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
import random
import os
from dotenv import load_dotenv

#loading env variables
load_dotenv()


# Initialize Flask app
app = Flask(__name__)
CORS(app,
     origins=["https://tuamarketplace.online", "http://localhost:3000"],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type"])


# Load environment variables
db_user = os.getenv("DB_USER", "bangusbros")
db_password = os.getenv("DB_PASSWORD", "bangusDevs2025")
db_name = os.getenv("DB_NAME", "tua_marketplace")
db_connection_name = os.getenv("DB_INSTANCE_CONNECTION_NAME", "tuamar-a7cfe:asia-southeast1:tuamar-db-2526")

# Connect using Unix socket
unix_socket_path = f"/cloudsql/{db_connection_name}"

engine = create_engine(
    f"mysql+mysqlconnector://{db_user}:{db_password}@/{db_name}",
    connect_args={
        "unix_socket": unix_socket_path
    }
)

# Generate embeddings
model = SentenceTransformer('all-MiniLM-L6-v2')



#Declare global data
data = None
X = None
kmeans= None
last_item_count = None




# Get current item count from DB
def get_item_count():
   query = "SELECT COUNT(*) FROM posted_items WHERE status = 'AVAILABLE'"
   return pd.read_sql(query, engine).iloc[0, 0]



# For text cleaning
def clean_text(text):
   text = text.lower()
   text = re.sub(r'[()\[\]\.,;:!?]', '', text)  # remove punctuation
   text = re.sub(r'\s+', ' ', text).strip()     # normalize whitespace
   return text



# Load and process data
def load_and_process_data():
   global data, X, kmeans, last_item_count
 
   item_query = "SELECT item_id, item_name, description, item_condition, category FROM posted_items WHERE status = 'AVAILABLE'"
   df = pd.read_sql(item_query, con=engine)
 
   # Clean and prepare data
   df = df[['item_id', 'item_name', 'description', 'category', 'item_condition']]
   df['combined'] = df['item_name'] + '   ' + df['category'] + '   ' + df['description'] + '   ' + df['item_condition']
 
   embeddings = model.encode(df['combined'].tolist(), normalize_embeddings=True, show_progress_bar=True)
 
   km = KMeans(random_state=42, n_clusters=3, n_init=10)
   km.fit(embeddings)
   df['cluster'] = km.labels_


   # Update global state
   data = df
   X = embeddings
   kmeans = km
   last_item_count = len(df)





# Initialize at startup
load_and_process_data()




# Only refresh if item count has changed
def refresh_if_needed():
   global last_item_count
   current_count = get_item_count()
   if current_count != last_item_count: #if item count changes
       load_and_process_data()


#For combining outputs of liked_items and search_history table
def items_from_behavior(user_id, sources=["liked", "searched", "viewed"]):

    queries = []

    if "liked" in sources:
        queries.append("SELECT DISTINCT item_name FROM liked_items WHERE user_id = :user_id")
        
    if "searched" in sources:
        queries.append("SELECT DISTINCT item_name FROM search_history WHERE user_id = :user_id")

    if "viewed" in sources:
        queries.append("SELECT DISTINCT item_name FROM item_view_history WHERE user_id = :user_id")

    combined_queries = " UNION ".join(queries)

    df = pd.read_sql(text(combined_queries), con=engine, params={"user_id": user_id})

    return df['item_name'].tolist()




# Recommendation function
def recommend_cluster(item_name, n=16):
   refresh_if_needed()
   try:
       # Clean and embed the input
       cleaned_query = clean_text(item_name)
       query_vec = model.encode(cleaned_query, normalize_embeddings=True)

       # Compute cosine similarity to all items
       similarities = cosine_similarity([query_vec], X).flatten()

       # Find the most similar item in your dataset
       best_match_idx = np.argmax(similarities)
       best_similarity = similarities[best_match_idx]


       if best_similarity < 0.45:
           return ["No close match found in dataset"]


       # Find cluster of this best match
       cluster_label = data.iloc[best_match_idx]['cluster']
       cluster_members = data[data['cluster'] == cluster_label].drop(index=best_match_idx)


       if cluster_members.empty:
           return ["Not enough products in this cluster"]


       # Get similarities within this cluster
       cluster_indices = cluster_members.index
       cluster_row_indices = [data.index.get_loc(i) for i in cluster_indices]
       cluster_vecs = X[cluster_row_indices]


       cluster_similarities = cosine_similarity([query_vec], cluster_vecs).flatten()


       top_n_idx = sorted(zip(cluster_similarities, cluster_indices), reverse=True)[:n]
       top_indices = [i for _, i in top_n_idx]


       return data.loc[top_indices, 'item_name'].tolist()


   except Exception as e:
       return [f"Error: {str(e)}"]
 


@app.route('/recommend-item', methods=['POST'])
def recommend_item():
   req_data = request.get_json()
   item_name = req_data.get('item_name')
 
   if not item_name:
       return jsonify({"error": "Missing item_name"}), 400

   try:
       recommendations = recommend_cluster(item_name.lower())

       all_items_recommended = []

       for recommendation in recommendations:
           items_recomm_query = "SELECT p.item_id, p.item_name, FORMAT(p.price, 2) AS price, p.item_condition, p.preview_pic, u.first_name, u.last_name, u.profile_pic, u.user_id FROM posted_items p JOIN users u ON p.user_id=u.user_id WHERE item_name = %s AND status = 'AVAILABLE' AND u.is_banned = 0"
           data_item = pd.read_sql(items_recomm_query, con=engine, params=(recommendation,))
           all_items_recommended.extend(data_item.to_dict(orient='records'))
           
       return jsonify(all_items_recommended)
   
   
   except Exception as e:
       return jsonify({"error": str(e)}), 500







@app.route('/personalized-recom', methods=['POST'])
def personalized_recom():
    print("✅ Received a POST request from React")
    kmeans_similarity_scores = []
    seen_ids = set()

    req_data = request.get_json()
    user_id = req_data.get('user_id')

    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400


    try:

        items = items_from_behavior(user_id, sources=["liked", "searched", "viewed"])

        all_items_recommended = []


        for item in items:
            item_recommendations = recommend_cluster(item.lower())

            for recommendation in item_recommendations:
                if recommendation.startswith("Error") or "No close match" in recommendation:
                    continue

                items_recomm_query = text("""
                    SELECT p.item_id, p.item_name, FORMAT(p.price, 2) AS price,
                           p.item_condition, p.preview_pic,
                           u.first_name, u.last_name, u.profile_pic, u.user_id
                    FROM posted_items p
                    JOIN users u ON p.user_id=u.user_id
                    WHERE p.item_name = :item_name AND p.status = 'AVAILABLE' AND u.is_banned = 0
                """)
                data_item = pd.read_sql(items_recomm_query, con=engine, params={"item_name": recommendation})

                for _, row in data_item.iterrows():
                    if row['item_id'] not in seen_ids:
                        all_items_recommended.append(row.to_dict())
                        seen_ids.add(row['item_id'])

                        # ✅ Exit early if we have 20 unique recommendations
                        if (len(seen_ids) >= 20):
                            random.shuffle(all_items_recommended)
                            return jsonify(all_items_recommended)

        # If fewer than 20 were found, still return what is currently available
        random.shuffle(all_items_recommended)
        return jsonify(all_items_recommended)


    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# --- Force CORS headers on all responses (universal fix for Cloud Run) ---
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "https://tuamarketplace.online")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response
# ------------------------------------------------------------------------


# Run Flask
if __name__ == '__main__':
   port = int(os.environ.get("PORT", 8080))  # fallback to 8080 if not set
   app.run(host='0.0.0.0', port=port)