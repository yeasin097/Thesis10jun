import requests
import time
import json
import threading
from concurrent.futures import ThreadPoolExecutor

# Configuration
BASE_URL = "http://localhost:8000"  # Matches app.js port 8000
VALID_NID = "5000000001"  # Replace with a valid NID
HEADERS = {"Content-Type": "application/json"}  # Removed JWT

# Function to log results
def log_result(test_name, success, message):
    with open("security_test_results.txt", "a") as f:
        f.write(f"{time.ctime()}: {test_name} - Success: {success}, Message: {message}\n")

# 1. IDOR Vulnerability Check
def test_idor_vulnerability():
    test_name = "IDOR Vulnerability Check"
    try:
        # Attempt to access another patient's EHR with a manipulated NID
        invalid_nid = "9999999999"  # Assumed invalid NID
        url = f"{BASE_URL}/patient/ehrs"
        payload = {"nid_no": invalid_nid}
        response = requests.post(url, headers=HEADERS, data=json.dumps(payload))
        
        if response.status_code == 200 and "patient_info" not in response.json():
            log_result(test_name, True, f"IDOR detected! Accessed EHR with NID {invalid_nid}: {response.text}")
        else:
            log_result(test_name, False, f"IDOR prevented. Status: {response.status_code}, Message: {response.json().get('error', 'No error')}")
    except Exception as e:
        log_result(test_name, False, f"Error: {str(e)}")

# 2. Unauthorized Network Join Attempt
def test_unauthorized_join():
    test_name = "Unauthorized Network Join Attempt"
    try:
        # Simulate a request without valid credentials (no NID or biometric data)
        url = f"{BASE_URL}/patient/ehrs"  # Test a protected endpoint
        response = requests.post(url, headers=HEADERS, data=json.dumps({}))
        
        if response.status_code == 400 or response.status_code == 404:
            log_result(test_name, False, f"Unauthorized join prevented. Status: {response.status_code}, Message: {response.json().get('error', 'No error')}")
        else:
            log_result(test_name, True, f"Unauthorized join succeeded! Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_result(test_name, False, f"Error: {str(e)}")

# 3. Malicious Ordering Simulation
def test_malicious_ordering():
    test_name = "Malicious Ordering Simulation"
    try:
        # Submit a valid EHR creation, then attempt a malicious override
        url = f"{BASE_URL}/ehr/create/nid"
        valid_payload = {
            "doctor_id": "d0001",
            "hospital_id": "h001",
            "ehr_details": json.dumps({"diagnosis": "Test", "visit_date": "2025-06-14"}),
            "nid_no": VALID_NID
        }
        response = requests.post(url, headers=HEADERS, data=json.dumps(valid_payload))
        
        if response.status_code == 201:
            ehr_id = response.json()["ehr_info"]["ehr_id"]
            malicious_payload = {
                "doctor_id": "d12345",
                "hospital_id": "hosp1",
                "ehr_details": json.dumps({"diagnosis": "Malicious", "visit_date": "2025-06-14"}),
                "nid_no": VALID_NID,
                "ehr_id": ehr_id  # Attempt to overwrite
            }
            malicious_response = requests.post(url, headers=HEADERS, data=json.dumps(malicious_payload))
            
            if malicious_response.status_code == 400 or "already exists" in malicious_response.text.lower():
                log_result(test_name, False, f"Malicious ordering detected and prevented. Status: {malicious_response.status_code}")
            else:
                log_result(test_name, True, f"Malicious ordering succeeded! Response: {malicious_response.text}")
        else:
            log_result(test_name, False, f"Failed to submit initial EHR. Status: {response.status_code}")
    except Exception as e:
        log_result(test_name, False, f"Error: {str(e)}")

# 4. Replay Attack Testing
def test_replay_attack():
    test_name = "Replay Attack Testing"
    try:
        # Submit a valid EHR creation and replay it
        url = f"{BASE_URL}/ehr/create/nid"
        valid_payload = {
            "doctor_id": "d12346",
            "hospital_id": "hosp2",
            "ehr_details": json.dumps({"diagnosis": "ReplayTest", "visit_date": "2025-06-14"}),
            "nid_no": VALID_NID
        }
        response = requests.post(url, headers=HEADERS, data=json.dumps(valid_payload))
        
        if response.status_code == 201:
            replay_data = json.dumps(valid_payload)  # Capture the request payload
            time.sleep(1)  # Allow time for processing
            replay_response = requests.post(url, headers=HEADERS, data=replay_data)
            
            if replay_response.status_code == 400 or "duplicate" in replay_response.text.lower():
                log_result(test_name, False, f"Replay attack prevented. Status: {replay_response.status_code}")
            else:
                log_result(test_name, True, f"Replay attack succeeded! Response: {replay_response.text}")
        else:
            log_result(test_name, False, f"Failed to submit initial EHR. Status: {response.status_code}")
    except Exception as e:
        log_result(test_name, False, f"Error: {str(e)}")

# 5. DoS Attack Simulation
def test_dos_attack():
    test_name = "DoS Attack Simulation"
    def send_request():
        try:
            url = f"{BASE_URL}/patient/ehrs"
            payload = {"nid_no": VALID_NID}
            response = requests.post(url, headers=HEADERS, data=json.dumps(payload))
            return response.status_code
        except Exception:
            return 500

    try:
        with ThreadPoolExecutor(max_workers=50) as executor:
            # Simulate 1000 concurrent requests
            futures = [executor.submit(send_request) for _ in range(1000)]
            results = [f.result() for f in futures]
            success_count = sum(1 for r in results if r == 200)
            error_count = sum(1 for r in results if r >= 400)
            
            if error_count > success_count:
                log_result(test_name, True, f"DoS simulation succeeded. Errors: {error_count}, Successes: {success_count}")
            else:
                log_result(test_name, False, f"DoS simulation failed. Errors: {error_count}, Successes: {success_count}")
    except Exception as e:
        log_result(test_name, False, f"Error: {str(e)}")

# Run all tests
if __name__ == "__main__":
    tests = [
        test_idor_vulnerability,
        test_unauthorized_join,
        test_malicious_ordering,
        test_replay_attack,
        test_dos_attack
    ]
    
    print("Starting security vulnerability tests...")
    for test in tests:
        test()
        time.sleep(2)  # Avoid overwhelming the server
    
    print("Tests completed. Check security_test_results.txt for details.")