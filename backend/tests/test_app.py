import pytest
import json
import os
from io import BytesIO
from app import app

# Test file content and name
DEMO_FILENAME = "demo_test_file.txt"
DEMO_CONTENT = b"This is a test file for upload."

@pytest.fixture(scope='module')
def client():
    """Set up the Flask test client."""
    with app.test_client() as client:
        yield client

def test_upload_file(client):
    """Test the file upload functionality."""
    data = {
        'file': (BytesIO(DEMO_CONTENT), DEMO_FILENAME)
    }

    # Call the upload API
    response = client.post('/api/upload', data=data, content_type='multipart/form-data')

    # Validate response
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'code' in json_data
    assert json_data['name'] == DEMO_FILENAME

    # Save the code for download testing
    with open('test_code.json', 'w') as f:
        json.dump({'code': json_data['code']}, f)

def test_download_file(client):
    """Test the file download functionality."""
    # Load the saved code from the previous test
    with open('test_code.json', 'r') as f:
        data = json.load(f)

    # Call the download API
    response = client.post('/api/download', json=data)

    # Validate the download response
    assert response.status_code == 200
    assert 'attachment;' in response.headers['Content-Disposition']

    # Verify the content of the downloaded file
    downloaded_content = response.data
    assert downloaded_content == DEMO_CONTENT

def teardown_module(module):
    """Clean up files created during tests."""
    if os.path.exists('test_code.json'):
        os.remove('test_code.json')
    if os.path.exists('transfer_info.json'):
        os.remove('transfer_info.json')
