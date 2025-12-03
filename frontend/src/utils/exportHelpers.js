// Export utilities for generating CSV and PDF files

export const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    let csvContent = headers.join(',') + '\n';

    data.forEach(row => {
        const values = headers.map(header => {
            let value = row[header];

            // Handle null/undefined
            if (value === null || value === undefined) {
                return '';
            }

            // Convert to string and escape quotes
            value = String(value).replace(/"/g, '""');

            // Wrap in quotes if contains comma, newline, or quote
            if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                return `"${value}"`;
            }

            return value;
        });

        csvContent += values.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPDF = (title, headers, data, filename, includeCharts = false, chartData = null) => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
    }

    // Build charts HTML if chart data is provided
    let chartsHTML = '';
    if (includeCharts && chartData) {
        const hasCollegeData = chartData.collegeChart && Array.isArray(chartData.collegeChart) && chartData.collegeChart.length > 0;
        const hasCategoryData = chartData.categoryChart && Array.isArray(chartData.categoryChart) && chartData.categoryChart.length > 0;

        if (hasCollegeData || hasCategoryData) {
            chartsHTML = `
        <div class="charts-section">
          <h2>Visual Analytics</h2>
          <div class="charts-grid">
            ${hasCollegeData ? `
              <div class="chart-item">
                <h3>Users by College</h3>
                <div class="chart-data">
                  ${chartData.collegeChart
                        .filter(item => {
                            const name = item.college_name || item.college || item.name || '';
                            const value = Number(item.user_count || item.students || item.count || 0);
                            // Only filter out if name is truly empty/null OR if it's explicitly 'Unknown'
                            return name.trim() !== '' && name !== 'Unknown' && value >= 0;
                        })
                        .map(item => {
                            const value = Number(item.user_count || item.students || item.count || 0);
                            const name = item.college_name || item.college || item.name || '';
                            const filteredData = chartData.collegeChart.filter(i => {
                                const n = i.college_name || i.college || i.name || '';
                                return n.trim() !== '' && n !== 'Unknown';
                            });
                            const maxValue = Math.max(...filteredData
                                .map(i => Number(i.user_count || i.students || i.count || 0)), 1);
                            const percentage = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 2;
                            return `
                        <div class="chart-bar">
                          <span class="chart-label">${name}</span>
                          <div class="bar-container">
                            <div class="bar-fill" style="width: ${percentage}%; min-width: 30px; background-color: #2e7d32;"></div>
                            <span class="bar-value">${value}</span>
                          </div>
                        </div>
                      `;
                        }).join('')}
                </div>
              </div>
            ` : ''}
            ${hasCategoryData ? `
              <div class="chart-item">
                <h3>Items by Category</h3>
                <div class="chart-data">
                  ${chartData.categoryChart
                        .filter(item => {
                            const name = item.category || item.name || '';
                            const value = Number(item.item_count || item.count || 0);
                            // Only filter out if name is truly empty/null OR if it's explicitly 'Unknown'
                            return name.trim() !== '' && name !== 'Unknown' && value >= 0;
                        })
                        .map(item => {
                            const value = Number(item.item_count || item.count || 0);
                            const name = item.category || item.name || '';
                            const filteredData = chartData.categoryChart.filter(i => {
                                const n = i.category || i.name || '';
                                return n.trim() !== '' && n !== 'Unknown';
                            });
                            const maxValue = Math.max(...filteredData
                                .map(i => Number(i.item_count || i.count || 0)), 1);
                            const percentage = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 2;
                            return `
                        <div class="chart-bar">
                          <span class="chart-label">${name}</span>
                          <div class="bar-container">
                            <div class="bar-fill" style="width: ${percentage}%; min-width: 30px; background-color: #2e7d32;"></div>
                            <span class="bar-value">${value}</span>
                          </div>
                        </div>
                      `;
                        }).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
        }
    }

    // Build HTML content
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #1b5e20;
          border-bottom: 3px solid #1b5e20;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h2 {
          color: #1b5e20;
          margin-top: 30px;
          margin-bottom: 15px;
        }
        h3 {
          color: #2e7d32;
          margin-bottom: 10px;
          font-size: 1.1rem;
        }
        .export-date {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 0.9rem;
        }
        th {
          background-color: #1b5e20;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f0f0f0;
        }
        .charts-section {
          margin-top: 30px;
          page-break-before: always;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 20px;
        }
        .chart-item {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 8px;
          background-color: #fff;
        }
        .chart-data {
          margin-top: 15px;
        }
        .chart-bar {
          margin-bottom: 12px;
        }
        .chart-label {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
          font-size: 0.85rem;
          color: #555;
        }
        .bar-container {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          min-height: 24px;
        }
        .bar-fill {
          height: 24px;
          min-width: 30px;
          border-radius: 4px;
          display: block;
        }
        .bar-value {
          font-weight: 600;
          font-size: 0.85rem;
          color: #333;
        }
        @media print {
          body {
            padding: 10px;
          }
          h1 {
            font-size: 1.5rem;
          }
          table {
            font-size: 0.8rem;
          }
          th, td {
            padding: 8px 6px;
          }
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="export-date">Exported on: ${new Date().toLocaleString()}</div>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined || value === '') {
            return '<td>N/A</td>';
        }
        return `<td>${value}</td>`;
    }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${chartsHTML}
    </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };
};

export const formatDateForExport = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
