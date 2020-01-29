FROM busybox:latest

RUN mkdir /app
COPY index.html /app
COPY favicon.ico /app
COPY manifest.json /app
COPY pwa.js /app
COPY robots.txt /app
COPY css/ /app/css/
COPY images/ /app/images/
COPY videos/ /app/videos/
COPY js/ /app/js/
COPY slides/ /app/slides/
COPY templates/ /app/templates/
COPY appicons/ /app/appicons/
EXPOSE 80
CMD ["httpd", "-f", "-p", "80", "-h", "/app"]
