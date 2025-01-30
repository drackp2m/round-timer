FROM node:22-alpine3.20 AS base

RUN apk add --no-cache build-base python3 openssl

ARG USER_GID
ARG USER_UID

RUN if [ -n "$USER_GID" ] && [ "$USER_GID" != "1000" ]; then \
			sed -i "s/node:x:1000:1000:/node:x:1000:$USER_GID:/" /etc/passwd; \
		fi && \
		if [ -n "$USER_UID" ] && [ "$USER_UID" != "1000" ]; then \
			sed -i "s/node:x:1000:/node:x:$USER_UID:/" /etc/passwd; \
		fi

WORKDIR /usr/src/app

RUN chown -R node:node /usr/src/app /home/node /usr/local/lib/node_modules /usr/local/bin



FROM base AS deps

USER node

COPY package.json package-lock.json* ./

RUN npm ci



FROM deps AS dev-attached

USER root

RUN apk add --no-cache sudo

RUN addgroup node root \
			&& echo "%root ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers

USER node

RUN sudo apk add --no-cache git openssh-client gnupg vim \
			zsh zsh-vcs alpine-zsh-config \
			zsh-theme-powerlevel10k zsh-syntax-highlighting

RUN git config --global --add safe.directory /usr/src/app

RUN mkdir /home/node/.gnupg \
			&& chmod 700 /home/node/.gnupg

CMD ["sh", "-c", "tail -f /dev/null"]



FROM deps AS build

USER node

COPY . .

RUN node --run build



FROM build AS serve

ARG APP_PORT

EXPOSE $APP_PORT

USER node

COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist/apps/app ./src

CMD ["node", "src/main.js"]
