FROM tiangolo/nginx-rtmp

COPY nginx.conf /etc/nginx/nginx.conf

USER root
RUN mkdir -p /tmp/hls/live && \
    mkdir -p /recordings && \
    chmod -R 777 /tmp/hls && \
    chmod -R 777 /recordings && \
    mkdir -p /var/log/nginx && \
    chmod -R 777 /var/log/nginx

EXPOSE 80 8080 1935

CMD ["nginx", "-g", "daemon off;"]