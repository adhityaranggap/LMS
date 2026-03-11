#!/bin/bash
# Module 11: Threat Intelligence
# Generate SSL certs, GPG keys, plant EICAR test files, weak TLS

echo "[module-11] Setting up Threat Intelligence lab..."

mkdir -p /opt/certs /opt/keys /opt/samples /opt/intel

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /opt/certs/server.key -out /opt/certs/server.crt \
  -subj "/C=ID/ST=Jawa Barat/L=Bekasi/O=LabCorp/CN=lab.internal" 2>/dev/null

# Generate expired certificate
openssl req -x509 -nodes -days 1 -newkey rsa:1024 \
  -keyout /opt/certs/expired.key -out /opt/certs/expired.crt \
  -subj "/C=ID/O=OldCorp/CN=expired.lab" 2>/dev/null
# Backdate it
touch -d "2024-01-01" /opt/certs/expired.crt

# Generate weak certificate (MD5, 512-bit - for demonstration)
openssl req -x509 -nodes -days 365 -newkey rsa:512 \
  -keyout /opt/certs/weak.key -out /opt/certs/weak.crt \
  -subj "/C=ID/O=WeakCorp/CN=weak.lab" 2>/dev/null || true

# Create GPG test keyring
export GNUPGHOME=/opt/keys/gpg
mkdir -p "$GNUPGHOME"
chmod 700 "$GNUPGHOME"
cat > /tmp/gpg-batch << 'GPGBATCH'
%no-protection
Key-Type: RSA
Key-Length: 2048
Subkey-Type: RSA
Subkey-Length: 2048
Name-Real: Lab User
Name-Email: labuser@lab.internal
Expire-Date: 0
%commit
GPGBATCH
gpg --batch --gen-key /tmp/gpg-batch 2>/dev/null || true
rm -f /tmp/gpg-batch

# Plant EICAR test file (standard anti-virus test string)
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > /opt/samples/test-malware.txt

# Create known hash samples
echo "This is a known malicious payload sample" > /opt/samples/payload.bin
md5sum /opt/samples/payload.bin > /opt/samples/known-hashes.txt
sha256sum /opt/samples/payload.bin >> /opt/samples/known-hashes.txt

# Create threat intel feed sample
cat > /opt/intel/ioc-feed.json << 'EOF'
{
  "indicators": [
    {"type": "ip", "value": "192.168.1.100", "threat": "C2 Server", "confidence": "high"},
    {"type": "domain", "value": "evil.example.com", "threat": "Phishing", "confidence": "medium"},
    {"type": "hash_md5", "value": "d41d8cd98f00b204e9800998ecf8427e", "threat": "Known Malware", "confidence": "high"},
    {"type": "url", "value": "http://evil.example.com/payload.exe", "threat": "Malware Delivery", "confidence": "high"}
  ],
  "last_updated": "2025-12-01T00:00:00Z"
}
EOF

cat > /home/student/README.txt << 'EOF'
Threat Intelligence Lab
=========================
Tasks:
1. Examine SSL certificates in /opt/certs/ — identify weak/expired certs
2. Use openssl to inspect cert details: openssl x509 -in /opt/certs/server.crt -text -noout
3. Verify GPG keys in /opt/keys/gpg/
4. Analyze samples in /opt/samples/ and compute file hashes
5. Cross-reference hashes with /opt/samples/known-hashes.txt
6. Review threat intel feed in /opt/intel/ioc-feed.json
EOF
chown student:student /home/student/README.txt 2>/dev/null || true

echo "[module-11] Threat Intelligence lab ready."
