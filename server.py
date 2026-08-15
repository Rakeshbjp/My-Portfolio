import http.server
import json
import os

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class PortfolioHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path.startswith('/api/save-data'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                payload = json.loads(post_data.decode('utf-8'))
                
                # Format as clean data.js JavaScript file
                data_js_path = os.path.join(DIRECTORY, 'js', 'data.js')
                formatted_json = json.dumps(payload, indent=2)
                
                js_content = f"""/**
 * ============================================================================
 * PORTFOLIO DATA CONFIGURATION
 * ============================================================================
 * Permanently saved directly to disk.
 * ============================================================================
 */

const portfolioData = {formatted_json};

// Export to Global Window Scope
window.portfolioData = portfolioData;
window.defaultPortfolioData = JSON.parse(JSON.stringify(portfolioData));
"""
                with open(data_js_path, 'w', encoding='utf-8') as f:
                    f.write(js_content)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = json.dumps({'success': True, 'message': 'Data permanently saved to js/data.js on disk!'})
                self.wfile.write(response.encode('utf-8'))
                print(f"[SUCCESS] Updated js/data.js on disk successfully.")
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                err_response = json.dumps({'success': False, 'error': str(e)})
                self.wfile.write(err_response.encode('utf-8'))
                print(f"[ERROR] Failed to save data: {e}")
                return

        self.send_error(404, "Endpoint not found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    server_address = ("127.0.0.1", PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, PortfolioHTTPRequestHandler)
    print(f"Serving Portfolio Live Server at http://127.0.0.1:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Server stopped.")
