FROM denoland/deno:2.5.6

EXPOSE 1993

WORKDIR /app

USER deno

RUN deno install

COPY . .

RUN deno cache main.ts

CMD ["deno", "task", "start"]