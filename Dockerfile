FROM busybox:latest

RUN mkdir /app
COPY index.html /app
COPY css/ /app/css/
COPY images/ /app/images/
COPY js/ /app/js/
COPY slides/ /app/slides/
COPY templates/ /app/templates
EXPOSE 80
CMD ["httpd", "-f", "-p", "80", "-h", "/app"]
