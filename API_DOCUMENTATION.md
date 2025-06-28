# Customer Information API Documentation

This document describes the comprehensive customer information APIs that return all data related to a customer.

## Overview

The customer information APIs provide complete access to all customer-related data including:
- Customer model data
- Test model data with completed exercises
- Test ratings
- Exercise asset files (processed results only)
- Section evaluations
- Training purposes
- Scores to beat
- Movement signatures
- Client information (if exists)
- Training categories
- Gender information

## Authentication

All endpoints require authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Endpoints

### 1. Get Customer by ID

**Endpoint:** `GET /api/customers/[id]`

**Description:** Fetches comprehensive customer information using the customer's UUID.

**Parameters:**
- `id` (path parameter): Customer UUID

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/customers/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer your-token-here"
```

### 2. Get Customer by Unique ID

**Endpoint:** `GET /api/customers/by-unique-id/[uniqueId]`

**Description:** Fetches comprehensive customer information using the customer's unique ID.

**Parameters:**
- `uniqueId` (path parameter): Customer's unique identifier

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/customers/by-unique-id/CUST001" \
  -H "Authorization: Bearer your-token-here"
```

### 3. Get Customer by Email

**Endpoint:** `GET /api/customers/by-email/[email]`

**Description:** Fetches comprehensive customer information using the customer's email address.

**Parameters:**
- `email` (path parameter): Customer's email address (URL encoded)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/customers/by-email/john.doe%40example.com" \
  -H "Authorization: Bearer your-token-here"
```

## Response Format

All endpoints return the same response structure:

```json
{
  "success": true,
  "customer": {
    // Basic customer information
    "id": "uuid",
    "name": "John Doe",
    "age": 30,
    "gender": "MALE",
    "height": 175.5,
    "weight": 70.0,
    "sleepLevels": 7.5,
    "activityLevel": "MODERATE",
    "calorieIntake": 2000,
    "mood": "GOOD",
    "uniqueId": "CUST001",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    
    // Related data arrays
    "tests": [
      {
        "id": "test-uuid",
        "date": "2024-01-01T00:00:00Z",
        "status": "COMPLETED",
        "customerId": "customer-uuid",
        "testerId": "tester-uuid",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "exercises": [
          {
            "id": "exercise-uuid",
            "name": "knee_flexion",
            "category": "mobility",
            "completed": true,
            "testId": "test-uuid",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z",
            "assetFiles": [
              {
                "id": "file-uuid",
                "fileName": "knee_flexion_processed.csv",
                "fileType": "processed",
                "s3PathProcessed": "s3://bucket/path/file.csv",
                "analysisResults": {
                  "metrics": {
                    "range_of_motion": 45.2,
                    "smoothness": 0.85
                  }
                },
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2024-01-01T00:00:00Z"
              }
            ]
          }
        ],
        "ratings": {
          "id": "rating-uuid",
          "overall": 8,
          "mobility": 7,
          "strength": 8,
          "endurance": 9,
          "testId": "test-uuid",
          "FeltAfterWorkOut": "ENERGIZED",
          "RPE": 6,
          "observation": "Good form throughout",
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-01-01T00:00:00Z"
        },
        "tester": {
          "id": "tester-uuid",
          "name": "Dr. Smith",
          "email": "dr.smith@example.com"
        }
      }
    ],
    "sectionEvaluations": [
      {
        "id": "eval-uuid",
        "customerId": "customer-uuid",
        "section": "mobility",
        "dropdowns": {
          "flexibility": "GOOD",
          "range_of_motion": "EXCELLENT"
        },
        "comments": {
          "notes": "Patient shows good flexibility"
        },
        "textLabels": {
          "custom_field": "Custom value"
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "trainingPurposes": [
      {
        "id": "purpose-uuid",
        "customerId": "customer-uuid",
        "category": "expand",
        "slot": 1,
        "title": "Improve Flexibility",
        "paragraph": "Focus on stretching exercises...",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "scoresToBeat": [
      {
        "id": "score-uuid",
        "customerId": "customer-uuid",
        "title": "Squat Depth",
        "current": 85,
        "best": 90,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "movementSignature": {
      "id": "signature-uuid",
      "customerId": "customer-uuid",
      "identity": "ATHLETE",
      "enduranceRating": 7,
      "mobilityRating": 8,
      "strengthRating": 6,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "client": {
      "id": "client-uuid",
      "fullName": "John Doe",
      "age": 30,
      "gender": "MALE",
      "email": "john.doe@example.com",
      "whatsapp": "+1234567890",
      "medicalHistory": "None",
      "whyMove": "Fitness goals",
      "fitnessGoal": "Improve strength",
      "uniqueId": "CLIENT001",
      "createdAt": "2024-01-01T00:00:00Z",
      "Booking": [
        {
          "id": "booking-uuid",
          "orderId": "ORDER001",
          "clientId": "client-uuid",
          "clientSessionNo": 1,
          "consentAgreement": true,
          "ageConfirmation": true,
          "paymentId": "PAY001",
          "paymentStatus": "PAID",
          "invoiceNumber": 1001,
          "timeSlotId": "slot-uuid",
          "createdAt": "2024-01-01T00:00:00Z",
          "timeSlot": {
            "id": "slot-uuid",
            "startTime": "2024-01-01T10:00:00Z",
            "endTime": "2024-01-01T11:00:00Z",
            "count": 1,
            "slotDateId": "date-uuid",
            "slotDate": {
              "id": "date-uuid",
              "date": "2024-01-01T00:00:00Z",
              "locationId": "location-uuid",
              "price": 100,
              "location": {
                "id": "location-uuid",
                "name": "Main Clinic",
                "address": "123 Main St",
                "link": "https://maps.google.com"
              }
            }
          }
        }
      ],
      "EmailLog": [
        {
          "id": "email-uuid",
          "clientId": "client-uuid",
          "emailType": "CONFIRMATION",
          "subject": "Appointment Confirmed",
          "status": "SENT",
          "sentVia": "SMTP",
          "sessionDate": "2024-01-01T10:00:00Z",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ]
    }
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Customer not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "An error occurred while fetching customer information"
}
```

## Notes

1. **Exercise Asset Files**: Only processed files with `fileType: "processed"` and `status: "processed"` are included in the response.

2. **Data Ordering**: All arrays are ordered by `createdAt` in descending order (newest first).

3. **Client Information**: The `client` field will be `null` if no matching client record is found.

4. **Tester Information**: Only basic tester information (id, name, email) is included for security reasons.

5. **Analysis Results**: The `analysisResults` field contains JSON data with processed exercise metrics and analysis.

## Usage Examples

### JavaScript/TypeScript
```typescript
const fetchCustomerInfo = async (customerId: string) => {
  const response = await fetch(`/api/customers/${customerId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch customer info');
  }
  
  return response.json();
};
```

### React Hook
```typescript
const useCustomerInfo = (customerId: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchCustomerInfo(customerId);
        setData(result.customer);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  return { data, loading, error };
};
``` 