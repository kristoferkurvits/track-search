# Track Metadata Search GraphQL API

This project is a GraphQL API built for a track metadata search service using Apollo Server. It allows fetching, creating, updating, and deleting track information. The API supports operations such as fetching tracks by name & artist name, listing all tracks, and modifying track details. It leverages the ACRCloud Metadata API for external track data.

## Prerequisites
Docker and docker-compose installed.

## Setup
To interact and test the GraphQL API, Apollo Studio is used, eliminating the need for a separate frontend.

For external track information, the service uses the [ACRCloud Metadata API](https://docs.acrcloud.com/reference/metadata-api). To access the ACRCloud API, sign up for credentials at [ACRCloud Console](https://console.acrcloud.com/signup#/register).

You have been provided a *.env.example* file. Fill in the missing field(s) and *rename the file to .env.dev* </br>

Run the command on your CLI
```
docker-compose up --build
```


### Authentication
Obtain a JWT token by calling the *issueToken* operation.
Use the obtained token in the Authorization header as "Bearer ${token}" for subsequent API requests.


### Usage
Detailed usage instructions and API documentation are available within Apollo Studio once the server is running.

Application is available on: http://localhost:4000/graphql </br>
For convenient interaction with the database use Graphical User Interface on: http://localhost:4321

### API Operations
* Fetch Track: Query a track by name and artist. If not found, it's fetched from the external API and stored.
* List All Tracks: Retrieve a list of all tracks in the database.
* Update/Delete Track: Perform update or delete operations on a track by its internal ID.

