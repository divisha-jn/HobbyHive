# External API Documentation

Complete API documentation for HobbyHive (fetching and geocoding Singapore amenities data).

## Overview

**Framework:** Next.js (App Router)  
**Base URL:**  
- Production: `https://2006-scsc-108-s6sa.vercel.app/`
- Development: `http://localhost:3000`

  
**Authentication:** None required for most endpoints (except nearest MRT)  
**Response Format:** JSON

---

## Endpoints

### 1. Get Community Clubs

Fetches all community clubs in Singapore with their locations.

**Method:** `GET`  
**Endpoint:** `/api/community-clubs`  
**Authentication:** None required

#### Response Schema
{
"success": boolean,
"clubs": Array<{
"name": string,
"address": string,
"latitude": number,
"longitude": number
}>,
"count": number
}


#### Success Response Example (200)

{
"success": true,
"clubs": [
{
"name": "Ang Mo Kio Community Club",
"address": "123 Ang Mo Kio Avenue 3 560123",
"latitude": 1.3691,
"longitude": 103.8454
}
],
"count": 1
}


#### Error Response Example (500)

{
"success": false,
"error": "Failed to fetch community clubs data"
}


**Data Source:** Data.gov.sg Community Clubs dataset

---

### 2. Geocode Address

Searches for Singapore addresses and returns coordinates using OneMap's geocoding service.

**Method:** `GET`  
**Endpoint:** `/api/geocode`  
**Authentication:** None required

#### Query Parameters

| Name  | Type   | Required | Description                    |
|-------|--------|----------|--------------------------------|
| query | string | Yes      | Address or location to search  |

#### Example Request

GET /api/geocode?query=Orchard%20Road


#### Response Schema

{
"success": boolean,
"found": number,
"totalPages": number,
"results": Array<{
"name": string,
"address": string,
"postalCode": string | null,
"latitude": number,
"longitude": number,
"building": string,
"roadName": string,
"blockNo": string
}>
}


#### Success Response Example (200)

{
"success": true,
"found": 10,
"totalPages": 1,
"results": [
{
"name": "ORCHARD ROAD",
"address": "123 ORCHARD ROAD SINGAPORE 238123",
"postalCode": "238123",
"latitude": 1.3048,
"longitude": 103.8318,
"building": "ION ORCHARD",
"roadName": "ORCHARD ROAD",
"blockNo": "123"
}
]
}


#### Error Responses

| Code | Message                          | Description                    |
|------|----------------------------------|--------------------------------|
| 400  | Query parameter is required      | Missing or empty query param   |
| 500  | Failed to geocode address        | External API or server error   |

**Data Source:** OneMap Search API (free, no authentication required)

---

### 3. Get Libraries

Fetches all public libraries in Singapore with their locations.

**Method:** `GET`  
**Endpoint:** `/api/libraries`  
**Authentication:** None required

#### Response Schema

{
"success": boolean,
"libraries": Array<{
"name": string,
"address": string,
"latitude": number,
"longitude": number
}>,
"count": number
}


#### Success Response Example (200)

{
"success": true,
"libraries": [
{
"name": "Bishan Public Library",
"address": "5 Bishan Place, #01-01",
"latitude": 1.3506,
"longitude": 103.8487
}
],
"count": 1
}


#### Error Response Example (500)

{
"success": false,
"error": "Failed to fetch libraries data"
}


**Data Source:** Data.gov.sg Libraries dataset

---

### 4. Get Nearest MRT Stations

Finds the nearest MRT stations to given coordinates.

**Method:** `POST`  
**Endpoint:** `/api/nearest-mrt`  
**Authentication:** OneMap token (handled internally)

#### Request Body

| Name | Type   | Required | Description           |
|------|--------|----------|-----------------------|
| lat  | number | Yes      | Latitude coordinate   |
| lng  | number | Yes      | Longitude coordinate  |

#### Request Example

{
"lat": 1.3521,
"lng": 103.8198
}


#### Success Response Example (200)

[
{
"name": "DHOBY GHAUT MRT STATION",
"distance": 250.5
}
]



#### Error Responses

| Code | Message                      | Description                        |
|------|------------------------------|------------------------------------|
| 400  | Missing required parameters  | lat or lng not provided            |
| 500  | Authentication failed        | OneMap token retrieval failed      |
| 500  | Failed to fetch MRT data     | OneMap API request failed          |

**Notes:** This endpoint automatically manages OneMap authentication tokens and retries with a fresh token if expired.

---

### 5. Get Parks

Fetches all parks in Singapore with their locations.

**Method:** `GET`  
**Endpoint:** `/api/parks`  
**Authentication:** None required

#### Response Schema

{
"success": boolean,
"parks": Array<{
"name": string,
"latitude": number,
"longitude": number
}>,
"count": number
}


#### Success Response Example (200)

{
"success": true,
"parks": [
{
"name": "East Coast Park",
"latitude": 1.3008,
"longitude": 103.9065
}
],
"count": 1
}


#### Error Response Example (500)

{
"success": false,
"error": "Failed to fetch parks data"
}


**Data Source:** Data.gov.sg Parks dataset

---

## Utility Functions

### findNearestMRT

Client-side utility function for finding the nearest MRT station.

#### Function Signature

async function findNearestMRT(
latitude: number,
longitude: number
): Promise<{ name: string; distance: number } | null>


#### Parameters

| Name      | Type   | Description          |
|-----------|--------|----------------------|
| latitude  | number | Latitude coordinate  |
| longitude | number | Longitude coordinate |

#### Returns

Object with MRT name (cleaned) and distance in meters, or `null` if error occurs.

#### Usage Example

const mrt = await findNearestMRT(1.3521, 103.8198);
if (mrt) {
console.log(Nearest: ${mrt.name}, ${mrt.distance}m away);
}


---

## Authentication Management

### OneMap Token Manager

Internal utility for managing OneMap API authentication (used by nearest MRT endpoint).

#### Functions

- **`getAccessToken()`**: Retrieves valid OneMap access token, fetching new one if expired
- **`setAccessToken(token, expiryTimestamp)`**: Stores token in memory with expiry
- **`getInMemoryAccessToken()`**: Returns cached token if still valid (with 1-hour buffer)


**Token Caching:** Tokens are cached in memory and reused until 1 hour before expiry to minimize authentication requests.

---

## Error Handling

All endpoints follow consistent error response format:

{
"success": false,
"error": "Error message description"
}


### Common HTTP Status Codes

| Code | Meaning                  | When Used                           |
|------|--------------------------|-------------------------------------|
| 200  | Success                  | Request completed successfully      |
| 400  | Bad Request              | Missing or invalid parameters       |
| 401  | Unauthorized             | Authentication failed (internal)    |
| 500  | Internal Server Error    | External API failure or server error|

---

## Data Sources

- **Data.gov.sg API:** Community clubs, libraries, and parks data
- **OneMap API:** Geocoding and nearest MRT functionality

**GeoJSON Handling:** All Data.gov.sg endpoints fetch GeoJSON data and transform coordinates from `[longitude, latitude]` to separate fields.

---

## Event Category to Location Mapping

HobbyHive’s recommendation system uses external APIs to suggest relevant locations based on event categories. The table below shows which location APIs are queried for each event category.

| Category            | Location APIs Used                   |
|---------------------|--------------------------------------|
| Sports & Fitness    | 🟢 Parks, 🟠 Clubs                    |
| Arts & Crafts       | 🟠 Clubs                              |
| Music               | 🟠 Clubs                              |
| Gaming              | 🟠 Clubs                              |
| Cooking & Baking    | 🟠 Clubs                              |
| Outdoor Activities  | 🟢 Parks                              |
| Photography         | 🟢 Parks, 🟠 Clubs                    |
| Dance               | 🟠 Clubs                              |
| Reading & Books     | 🟣 Libraries, 🟠 Clubs                |
| Language Learning   | 🟣 Libraries, 🟠 Clubs                |
| Other               | None (Manual entry)                  |

**Legend:**
- 🟢 **Parks**: `/api/parks` endpoint
- 🟠 **Clubs**: `/api/community-clubs` endpoint
- 🟣 **Libraries**: `/api/libraries` endpoint

**Usage:**  
When a user creates an event or searches by category, the system fetches location data from the corresponding APIs to provide contextually relevant venue suggestions near the user’s specified location.
