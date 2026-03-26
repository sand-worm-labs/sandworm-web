FROM python:3.9-slim

#### ORACLE INSTANT CLIENT ####
ARG TARGETARCH

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y \
    libpq-dev \
    r-base \
    python3-dev \
    graphviz \
    libgraphviz-dev \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    jq \
    git \
    gdal-bin \
    libgdal-dev \
    curl \
    libaio1t64 \
    alien \
    && rm -rf /var/lib/apt/lists/*

# Download Oracle Instant Client RPM, convert to DEB, and install
RUN if [ "$TARGETARCH" = "arm64" ]; then \
    curl -o /tmp/oracle-instantclient-basiclite.rpm https://download.oracle.com/otn_software/linux/instantclient/1924000/oracle-instantclient19.24-basiclite-19.24.0.0.0-1.aarch64.rpm && \
    alien -i /tmp/oracle-instantclient-basiclite.rpm && \
    rm /tmp/oracle-instantclient-basiclite.rpm; \
    elif [ "$TARGETARCH" = "amd64" ]; then \
    curl -o /tmp/oracle-instantclient-basiclite.rpm https://download.oracle.com/otn_software/linux/instantclient/2340000/oracle-instantclient-basic-23.4.0.24.05-1.el8.x86_64.rpm && \
    alien -i /tmp/oracle-instantclient-basiclite.rpm && \
    rm /tmp/oracle-instantclient-basiclite.rpm; \
    else \
    echo "Unsupported architecture: $TARGETARCH"; \
    exit 1; \
    fi

# Set environment variables for Oracle Instant Client
ENV LD_LIBRARY_PATH="/usr/lib/oracle/19.24/client64/lib:/usr/lib/oracle/23.4/client64/lib:${LD_LIBRARY_PATH}"
ENV ORACLE_HOME="/usr/lib/oracle/19.24/client64:/usr/lib/oracle/23.4/client64"
#### END OF ORACLE INSTANT CLIENT ####

# Set the GDAL version
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

ARG JUPYTER_REQUIREMENTS_FILE=requirements.txt
COPY $JUPYTER_REQUIREMENTS_FILE ./requirements.txt

RUN pip install --upgrade pip
RUN pip install --no-cache-dir jupyter_server
RUN pip install --no-cache-dir ipykernel

RUN pip install --no-cache-dir -r requirements.txt

# jupyter extension
COPY ./sandworm_fs_bridge /usr/src/sandworm_fs_bridge
RUN pip install /usr/src/sandworm_fs_bridge
RUN jupyter server extension enable sandworm_fs_bridge --sys-prefix



RUN useradd -m -d /home/sandwormuser sandwormuser
RUN groupadd -g 1001 sandworm && usermod -aG sandworm sandwormuser

USER sandwormuser
WORKDIR /home/sandwormuser

COPY ./example-data/ /home/sandwormuser