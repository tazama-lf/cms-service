FROM --platform=${TARGETPLATFORM:-linux/amd64} ghcr.io/openfaas/of-watchdog:0.8.4 as watchdog
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:16.17-alpine as ship

ARG TARGETPLATFORM
ARG BUILDPLATFORM

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog

RUN addgroup -S app && adduser -S -g app app

RUN apk --no-cache add curl ca-certificates

# Turn down the verbosity to default level.
ENV NPM_CONFIG_LOGLEVEL warn

# Create a folder named function
RUN mkdir -p /home/app

# Wrapper/boot-strapper
WORKDIR /home/app

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./tsconfig.json ./

# Install dependencies
RUN npm install

COPY ./src ./src

# Build the project
RUN npm run build

# Environment variables for openfaas
ENV cgi_headers="true"
ENV fprocess="node ./build/index.js"
ENV mode="http"
ENV upstream_url="http://127.0.0.1:3000"

ENV exec_timeout="10s"
ENV write_timeout="15s"
ENV read_timeout="15s"

ENV prefix_logs="false"

# Service-Based Enviroment Variables
ENV FUNCTION_NAME="cms-service"
ENV NODE_ENV="production"
ENV REST_PORT=3000

ENV LOGSTASH_URL=logstash.development:8080

ENV APM_LOGGING=true
ENV APM_URL=http://apm-server.development:8200
ENV APM_SECRET_TOKEN=
ENV FORWARD_REQUEST=true
ENV FORWARD_URL=

ENV NUXEO_AUTH=
ENV NUXEO_HOST=
ENV NUXEO_FOLDER_PATH=
ENV NUXEO_FOLDER_ID=

HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1

# Execute watchdog command
CMD ["fwatchdog"]
