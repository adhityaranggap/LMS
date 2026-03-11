FROM debian:12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    nmap tcpdump tshark hping3 gpg openssl whois curl wget \
    python3 net-tools iputils-ping traceroute dnsutils arp-scan \
    vim nano less man-db bash-completion iproute2 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash student
USER student
WORKDIR /home/student

CMD ["sleep", "infinity"]
