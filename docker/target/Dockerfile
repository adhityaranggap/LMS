FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server apache2 vsftpd samba \
    rsyslog auditd libpam-cracklib \
    tcpdump net-tools iputils-ping iproute2 \
    supervisor python3 curl vim nano \
    openssl gnupg iptables sudo cron \
    && rm -rf /var/lib/apt/lists/*

# Prepare SSH directory
RUN mkdir -p /run/sshd

# All services disabled by default — module scripts enable what's needed
COPY entrypoints/ /opt/lab-setup/
RUN chmod +x /opt/lab-setup/*.sh

ENV LAB_MODULE=0

ENTRYPOINT ["/opt/lab-setup/common-setup.sh"]
CMD ["sleep", "infinity"]
