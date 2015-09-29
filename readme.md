# Member of Groups
* Fahziar Riesad Wutono / 13512012
* Luthfi Hamid Masykuri / 13512100

# Prerequisites
* Linux debian based.
* Java installed.

# Install Dependencies

Add Debian jessie-backports to your sources.list file. Example:
```
echo "deb http://http.debian.net/debian jessie-backports main" | \
sudo tee -a /etc/apt/sources.list
```
Install the gRPC Debian package
```
sudo apt-get update
sudo apt-get install libgrpc-dev
```

# Compile Sources
```
./gradlew build
```
# Run Application
Run server
```
./server
```
Run client
```
./client
```
