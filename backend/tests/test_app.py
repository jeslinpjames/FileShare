import os
import pytest
import json
from io import BytesIO
from app import app, UPLOAD_FOLDER

# Create a temporary filename for testing
DEMO_FILENAME = "demo_test_file.txt"
DEMO_CONTENT = b"This is a test file for upload."

@pytest.fixture(scope='module')
def client():
    """Setup Flask test client."""
    with app.test_client() as client:
        yield client

def test_upload_file(client):
    """Test the file upload functionality."""
    # Create a BytesIO object to simulate a file
    data = {
        'file': (BytesIO(DEMO_CONTENT), DEMO_FILENAME)
    }

    # Call the upload API
    response = client.post('/upload', data=data, content_type='multipart/form-data')

    # Ensure the response is valid and contains a code
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'code' in json_data
    assert json_data['name'] == DEMO_FILENAME

    # Verify the file was uploaded correctly
    uploaded_file_path = os.path.join(UPLOAD_FOLDER, DEMO_FILENAME)
    assert os.path.exists(uploaded_file_path)

    # Save the code for the download test
    with open('test_code.json', 'w') as f:
        json.dump({'code': json_data['code']}, f)

def test_download_file(client):
    """Test the file download functionality."""
    # Load the saved code from the upload test
    with open('test_code.json', 'r') as f:
        data = json.load(f)

    # Call the download API with the code
    response = client.post('/download', json=data)

    # Ensure the response is valid and returns a file
    assert response.status_code == 200
    assert response.headers['Content-Disposition'].startswith('attachment;')

    # Verify the content of the downloaded file
    downloaded_content = response.data
    assert downloaded_content == DEMO_CONTENT

def teardown_module(module):
    """Cleanup any files created during testing."""
    # Remove the demo file from the uploads folder
    uploaded_file_path = os.path.join(UPLOAD_FOLDER, DEMO_FILENAME)
    if os.path.exists(uploaded_file_path):
        os.remove(uploaded_file_path)

    # Remove the temporary test code JSON file
    if os.path.exists('test_code.json'):
        os.remove('test_code.json')

    # Remove the transfer info JSON file if it exists
    if os.path.exists('transfer_info.json'):
        os.remove('transfer_info.json')
