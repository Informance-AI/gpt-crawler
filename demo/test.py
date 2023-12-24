import requests
import json

# Define the URL of the API endpoint
url = 'http://localhost:3001/crawl'

# Define the configuration data from config.ts
config_data = {
    "url": "https://www.builder.io/c/docs/developers",
    "match": "https://www.builder.io/c/docs/**",
    "maxPagesToCrawl": 5,
    "outputFileName": "/Users/chuci/Documents/GitKraken/gpt-crawler/output-1.json",
}

# Convert the config data to JSON and save it as a file
with open('config.json', 'w') as config_file:
    json.dump(config_data, config_file)

# Open the config file in binary mode to send as a file
with open('config.json', 'rb') as config_file:
    files = {
        'config': ('config.json', config_file, 'application/json')
    }

    # Send the POST request with the file
    response = requests.post(url, files=files)

# Check if the request was successful
if response.status_code == 200:
    # # Save the response content as output-1.json
    # with open('/Users/chuci/Documents/GitKraken/gpt-crawler/demo/output.json', 'w') as output_file:
    #     output_file.write(response.text)
    # print("Output saved as output-1.json")
    print(response.text)
else:
    print(f"Error: {response.status_code} - {response.text}")