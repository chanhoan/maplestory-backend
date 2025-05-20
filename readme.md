# 이벤트/보상 관리 시스템

## 목차

1. 프로젝트 개요
2. 설계 목표 & 원칙
3. 아키텍처 개요
4. 시퀀스 다이어그램
5. DB 설계
6. API 설계
7. 이벤트 기반 처리 & Kafka
8. SAGA 패턴
9. 실행 방법

---

## 1. 프로젝트 개요

* **이벤트/보상 관리 시스템**은 사용자의 행동(로그인, 구매 등)을 기반으로 다양한 이벤트를 운영하고, 조건 충족 시 보상을 지급하거나 요청을 관리합니다.
* 주요 기능:

  * 이벤트 생성/조회/삭제(soft/hard)
  * 조건별(연속 로그인) 자동 진행도 계산
  * 보상 등록/조회/요청/승인
  * 사용자 삭제 SAGA: 관련 모든 데이터 soft-delete → 30일 후 하드 삭제

---

### 2. 설계 목표 & 원칙

#### 개발자를 위한 설계

1. **확장성(Scalability)**

   * 새로운 이벤트 타입(예: 구매·레벨업 등)과 보상 정책(포인트·쿠폰 등)을 도입할 때, 도메인 모델(`conditionParams`, `metadata`)만 수정하면 되고 별도의 스키마 마이그레이션 없이 확장 가능합니다.
   * Mongoose Mixed 타입을 활용해 코드 수정 없이도 다양한 속성을 유연하게 지원함으로써 개발 생산성과 유지보수성을 높였습니다.

2. **레이어드 아키텍처 적용**

   * `Controller → Service → Repository` 구조로 책임을 분리하여 각 레이어가 검증·비즈니스 로직·데이터 접근 역할에 집중합니다.
   * DTO/Validation과 Swagger 문서화를 통해 API 계약을 자동화하고, 프론트엔드 및 외부 협력 팀과의 협업 효율을 극대화했습니다.

#### 사용자를 위한 설계

1. **이벤트 기반 비동기 처리**

   * 사용자 삭제, 보상 승인 등 무거운 작업을 Kafka 큐로 비동기 수행하여, API 호출 시점에 즉시 ‘ACCEPTED’ 응답을 반환함으로써 화면 전환 속도를 최적화했습니다.
   * ms 단위의 일시적 데이터 정합성 지연은 UX 관점에서 무시 가능한 수준으로 보고, 최종 사용자에게 **빠르고 쾌적한 응답 경험**을 제공합니다.

2. **SAGA 패턴으로 안정적 트랜잭션**

   * 분산 트랜잭션 구현이 어려운 사용자 삭제/데이터 연관 작업에 SAGA 오케스트레이션을 적용했습니다.
   * 단계별 처리 중 오류 발생 시 역순으로 보상(compensateStep)하며 데이터 정합성을 보장하고, 사용자는 복잡한 롤백 과정을 인지하지 않고 **안정적인 서비스 경험**을 유지합니다.


---

## 3. 아키텍처 개요

![alt text](/img/architecture.png)

---

## 4. 시퀀스 다이어그램

1. **로그인 이벤트 참여 시퀀스**

![alt text](/img/sequence_event.png)

2. **유저 삭제 SAGA 패턴 시퀀스**

![alt text](/img/sequence_saga.png)

---

## 5. DB 설계

#### 1. users

| 필드           | 타입       | 제약/인덱스             | 설명                      |
| ------------ | -------- | ------------------ | ----------------------- |
| \_id         | ObjectId | 기본                 | 사용자 고유 ID               |
| username     | string   | unique, indexed    | 로그인 ID                  |
| email        | string   | unique, indexed    | 이메일                     |
| passwordHash | string   |                   | 해시된 비밀번호                |
| role         | string   | indexed            | USER, OPERATOR, ADMIN 등 |
| status       | string   |                   | ACTIVE, SUSPENDED 등     |
| profile      | object   |                   | 부가 프로필(이름, 연락처 등)       |
| createdAt    | Date     | indexed (TTL 용도로도) | 생성 일시                   |
| updatedAt    | Date     |                   | 수정 일시                   |
| deletedAt    | Date     |                   | 삭제 일시                   |

#### 2. events

| 필드              | 타입       | 제약/인덱스  | 설명                                    |
| --------------- | -------- | ------- | ------------------------------------- |
| \_id            | ObjectId | 기본      | 이벤트 고유 ID                             |
| name            | string   | indexed | 이벤트명 (예: “7일 연속 출석”)                  |
| description     | string   | -       | 상세 설명                                 |
| conditionType   | string   | -       | CONSECUTIVE\_LOGIN, INVITE\_FRIENDS 등 |
| conditionParams | object   | -       | `{ days: 7 }`, `{ count: 3 }` 등       |
| startAt         | Date     | indexed | 이벤트 시작일                               |
| endAt           | Date     | indexed | 이벤트 종료일                               |
| isActive        | boolean  | indexed | 운영 중 여부                               |
| createdAt       | Date     | -       | 생성 일시                                 |
| updatedAt       | Date     | -       | 수정 일시                                 |
| deletedAt       | Date     | -       | 삭제 일시                                 |

#### 3. rewards

| 필드        | 타입       | 제약/인덱스       | 설명                                          |
| --------- | -------- | ------------ | ------------------------------------------- |
| \_id      | ObjectId | 기본           | 보상 고유 ID                                    |
| eventId   | ObjectId | indexed, ref | `events._id` 참조                             |
| type      | string   | indexed      | POINT, ITEM, COUPON 등                       |
| metadata  | object   | -            | `{ amount: 1000 }`, `{ itemId: 'sword' }` 등 |
| createdAt | Date     | -            | 생성 일시                                       |
| updatedAt | Date     | -            | 수정 일시                                       |
| deletedAt | Date     | -            | 삭제 일시                                       |

#### 4. event_progress

| 필드         | 타입       | 제약/인덱스                                  | 설명                          |
| ---------- | -------- | --------------------------------------- | --------------------------- |
| \_id       | ObjectId | 기본                                      | 프로젝션 문서 고유 ID               |
| userId     | ObjectId | indexed                                 | 사용자 ID                      |
| eventId    | ObjectId | indexed, composite idx(userId, eventId) | 이벤트 ID                      |
| progress   | number   | -                                       | 조건에 부합한 현재 값 (예: 연속 로그인 일수) |
| required   | number   | -                                       | `conditionParams`의 기준 값     |
| eligible   | boolean  | -                                       | `progress >= required` 결과   |
| lastUpdate | Date     | -                                       | 마지막 갱신 시각                   |
| deletedAt  | Date     | -                                       | 삭제 일시                       |


#### 5. reward_requests

| 필드          | 타입       | 제약/인덱스                    | 설명                                      |
| ----------- | -------- | ------------------------- | --------------------------------------- |
| \_id        | ObjectId | 기본                        | 요청 고유 ID                                |
| userId      | ObjectId | indexed, ref(users.\_id)  | 요청한 사용자 ID (`users._id` 참조)             |
| eventId     | ObjectId | indexed, ref(events.\_id) | 요청된 이벤트 ID (`events._id` 참조)            |
| status      | string   | indexed                   | PENDING, APPROVED, REJECTED             |
| requestedAt | Date     | indexed                   | 요청 일시                                   |
| processedAt | Date     | -                         | 처리 일시                                   |
| operatorId  | ObjectId | -                         | 처리자 ID (`users._id`, OPERATOR/ADMIN 참조) |
| reason      | string   | -                         | 거절 사유                                   |
| createdAt   | Date     | -                         | 생성 일시                                   |
| updatedAt   | Date     | -                         | 수정 일시                                   |
| deletedAt   | Date     | -                         | 삭제 일시                                   |


---

## 6. API 설계


#### 1. 인증 (Auth) API

| 메서드    | 경로                              | 인증         | 요청 DTO              | 응답 DTO               | HTTP 상태 | 설명                    |
| ------ | ------------------------------- | ---------- | ------------------- | -------------------- | ------- | --------------------- |
| GET    | `/api/auth/duplicate/:username` | Public     | -                   | `DuplicateResponse`  | 200     | 아이디 중복 검사             |
| POST   | `/api/auth/register`            | Public     | `RegisterRequest`   | `RegisterResponse`   | 201     | 회원가입                  |
| POST   | `/api/auth/login`               | Public     | `LoginRequest`      | `LoginResponse`      | 200     | 로그인 → 액세스 토큰 발급       |
| POST   | `/api/auth/logout`              | Bearer     | -                   | `BasicResponse`      | 200     | 로그아웃                  |
| POST   | `/api/auth/refresh`             | Bearer     | -                   | `LoginResponse`      | 200     | 리프레시 토큰 → 새 액세스 토큰    |
| GET    | `/api/auth/info`                | Bearer     | -                   | `GetProfileResponse` | 200     | 내 프로필 조회              |
| PUT    | `/api/auth/info`                | Bearer     | `UpdateInfoRequest` | `BasicResponse`      | 200     | 내 프로필 수정              |
| DELETE | `/api/auth`                     | Bearer     | -                   | `BasicResponse`      | 202     | 사용자 삭제 요청 (soft+SAGA) |
| GET    | `/api/auth/all-users`           | Bearer(\*) | -                   | `AllUserResponse`    | 200     | 모든 사용자 조회             |
| PUT    | `/api/auth/roles`               | Bearer(\*) | `AssignRoleRequest` | `BasicResponse`      | 202     | 사용자 권한 부여             |

> \* OPERATOR 혹은 ADMIN만 등록 가능, 그 외 조회는 인증된 모든 사용자


#### 2. 이벤트 (Event) API

| 메서드  | 경로                | 인증         | 요청 DTO                 | 응답 DTO                  | HTTP 상태 | 설명              |
| ---- | ----------------- | ---------- | ---------------------- | ----------------------- | ------- | --------------- |
| POST | `/api/events`     | Bearer(OP) | `EventRegisterRequest` | `EventRegisterResponse` | 201     | 이벤트 등록          |
| GET  | `/api/events`     | Bearer(\*) | `EventFilterRequest`   | `GetAllEventResponse`   | 200     | 이벤트 목록 조회 (필터링) |
| GET  | `/api/events/:id` | Bearer(\*) | -                      | `GetEventResponse`      | 200     | 단일 이벤트 상세 조회    |

> \* `OPERATOR` 또는 `ADMIN` 권한 필요 (등록)
> 기본적으로 인증된 모든 사용자 접근 가능


#### 3. 보상 (Reward) API

| 메서드  | 경로                                 | 인증         | 요청 DTO                  | 응답 DTO                   | HTTP 상태 | 설명             |
| ---- | ---------------------------------- | ---------- | ----------------------- | ------------------------ | ------- | -------------- |
| POST | `/api/events/:eventId/rewards`     | Bearer(OPERATOR) | `RewardRegisterRequest` | `RewardRegisterResponse` | 201     | 보상 등록          |
| GET  | `/api/events/:eventId/rewards`     | Bearer(\*) | `RewardFilterRequest`   | `GetAllRewardResponse`   | 200     | 보상 목록 조회 (필터링) |
| GET  | `/api/events/:eventId/rewards/:id` | Bearer(\*) | -                       | `GetRewardResponse`      | 200     | 단일 보상 상세 조회    |

> \* `OPERATOR` 혹은 `ADMIN`만 등록 가능, 그 외 조회는 인증된 모든 사용자


#### 4. 보상 요청 (Reward Request) API

| 메서드  | 경로                              | 인증                 | 요청 DTO                       | 응답 DTO                          | HTTP 상태 | 설명                |
| ---- | ------------------------------- | ------------------ | ---------------------------- | ------------------------------- | ------- | ----------------- |
| POST | `/api/events/:eventId/requests` | Bearer(USER)       | -                            | `RewardRequestRegisterResponse` | 201     | 보상 요청 생성          |
| GET  | `/api/events/requests`          | Bearer(USER/AUDITOR/ADMIN) | `RewardRequestFilterRequest` | `GetAllRewardRequestResponse`   | 200     | 나의/전체 보상 요청 목록 조회 |
| GET  | `/api/events/requests/:id`      | Bearer(USER/AUDITOR/ADMIN) | -                            | `GetRewardRequestResponse`      | 200     | 단일 보상 요청 상세 조회    |

> USER는 본인 요청만, AUDITOR/ADMIN은 전체 요청 조회·상세 조회 가능


#### 5. 사용자 데이터 SAGA (Event Deletion) API

| 메서드    | 경로                            | 인증     | 요청 DTO | 응답 DTO | HTTP 상태 | 설명                 |
| ------ | ----------------------------- | ------ | ------ | ------ | ------- | ------------------ |
| DELETE | `/api/events/:userId`         | Bearer | -      | -      | 204     | 해당 사용자의 이벤트 소프트 삭제 |
| POST   | `/api/events/:userId/restore` | Bearer | -      | -      | 204     | 해당 사용자의 이벤트 복구     |

---

## 7. 이벤트 기반 처리 & Kafka

#### 개요

로그인, 회원 탈퇴, 프로그레스 업데이트 등 주요 비즈니스 로직을 비동기로 분리하여 시스템 확장성과 응답 속도를 확보하기 위해 Kafka를 도입했습니다.

#### 토픽 구조

* **user.login**

  * 로그인 직후 발행 → `EventProgressService`가 구독
* **user.deletion.requested / succeeded / failed**

  * 회원 탈퇴 요청부터 최종 성공·실패까지 SAGA 흐름 제어
* **event.progress.failed / event.progress.dlq**

  * 프로그레스 업데이트 재시도 한계 초과 시 DLQ에 기록

#### 메시지 흐름

1. **로그인 완료 → publish ‘user.login’**
2. Kafka Broker에 기록
3. `EventProgressService` 구독 → `upsertLoginProgress()` 수행
4. **조건 충족 시 → bulkApprove()**
5. 예외 발생 시 → `event.progress.failed`·`event.progress.dlq` 발행

#### 기대 효과

* **응답 속도 향상**

  * 로그인 API는 ms 단위로 즉시 응답
  * 백그라운드에서 프로그레스만 처리
* **독립적 확장**

  * 트래픽 급증 시 프로그레스 소비자만 별도 스케일링
* **장애 내성**

  * DLQ에 실패 메시지를 모아 재처리·모니터링

---

## 8. 분산 트랜잭션 관리: SAGA 패턴

#### 전체 플로우

1. 클라이언트 → `DELETE /api/auth` → **publish ‘user.deletion.requested’**
2. `UserDeletionOrchestrator` 수신
3. 단계별 soft‑delete

   * 이벤트 서비스 → `EventService.softDeleteByUser()`
   * 프로그레스 서비스 → `EventProgressRepository.softDeleteByUser()`
   * 보상 요청 서비스 → `RewardRequestRepository.softDeleteByUser()`
4. **정상 완료 → publish ‘user.deletion.succeeded’**, 클라이언트에 `202 Accepted` 응답

#### 오류 발생 시 보상

* 특정 단계에서 예외 발생 시, 이전 단계부터 **역순 복구**

  1. 이벤트 서비스 복구
  2. 프로그레스 복구
  3. 보상 요청 복구
* 최종적으로 **publish ‘user.deletion.failed’**

#### 크론 스케줄러: 하드 삭제

* 매일 자정 `@Cron('0 0 * * *')`
* 30일 이상 경과한 soft‑deleted 문서 하드 삭제
* 감사 로그 보관 후 완전 제거

#### 설계 포인트

* **사용자 경험**: 탈퇴 과정은 백그라운드에서 안전하게 실행, 사용자 화면은 즉시 완료 처리
* **데이터 정합성**: 단계별 rollback(보상)으로 사후 정합성 확보
* **유지보수성**: 각 단계가 독립 모듈로 분리되어, 로직 수정·테스트가 용이

---

## 9. 추가 설명

* **스케줄러**: 매일 자정 30일 지난 soft‑deleted 문서 하드 삭제
* **DTO + Validation**: `class-validator`와 `@nestjs/swagger`를 활용해 요청/응답 사양을 엄격히 검증하고 자동 문서화
* **레이어드 아키텍처**: Controller / Service / Repository 계층 분리로 책임 명확화, 테스트·유지보수 용이
* **Repository 패턴**: Mongoose 모델 직접 호출을 캡슐화하여 비즈니스 로직과 데이터 접근 로직을 완전 분리
* **Mixed 타입 활용**: 이벤트 조건(`conditionParams`)과 보상 메타데이터(`metadata`)를 자유형 객체로 저장해 스키마 변경 최소화
* **Kafka 비동기 처리**: 사용자 경험을 해치지 않으면서도 대량 트래픽 대응과 장애 내성을 확보
* **SAGA 보상 로직**: 분산 트랜잭션 실패 시 단계별 역보상(compensateStep)으로 데이터 정합성 유지
* **보안**

  * JWT 기반 인증·인가 적용 (`JwtAuthGuard`, `RolesGuard`)
  * 민감 정보 노출 방지를 위한 TSDoc/SWAGGER 문서화 시 보안 필드 관리
* **환경 구성**:

  * `@nestjs/config`로 환경변수 일원화 관리
  * Docker Compose로 서비스·DB·Kafka·Redis를 컨테이너 단위로 배포 가능
* **테스트**:

  * 각 레이어별 유닛 테스트 작성
  * Kafka와 MongoDB를 모킹한 통합 테스트로 전반적 흐름 검증

---

## 9. 개선사항

1. **모니터링·메트릭 계측 추가**

   * Prometheus용 `Counter`, `Histogram` 계측 지점 삽입
   * `/metrics` 엔드포인트 노출 후 Grafana 대시보드 구성

2. **구조화된 로그 도입**

   * Pino 또는 Winston을 JSON 포맷으로 설정
   * 주요 비즈니스 이벤트, 오류·상태 전환 구간에 `logger.info`/`logger.error` 활용

3. **알림·경고 체계**

   * Prometheus Alertmanager 또는 Grafana Alert를 이용해 에러·DLQ 급증 시 즉시 알림
   * Slack/Email 연동

4. **문서화 보완**

   * OpenAPI( Swagger ) 완전 자동화 및 Postman Collection 제공
   * ER 다이어그램, 시퀀스 다이어그램 등 문서 추가

---

## 10. 실행 방법


#### docker-compose 환경변수 파일일
```env
KAFKA_BROKERS=kafka:9092

AUTH_KAFKA_CLIENT_ID=auth
AUTH_KAFKA_GROUP_ID=auth-service

EVENT_KAFKA_CLIENT_ID=events
EVENT_KAFKA_GROUP_ID=event-service

KAFKA_SASL_USERNAME=
KAFKA_SASL_PASSWORD=

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

MONGO_AUTH_USER_ADMIN=auth_mongo_admin
MONGO_AUTH_PASS_ADMIN=
MONGO_AUTH_USER=auth_mongo_user
MONGO_AUTH_PASS=
MONGO_AUTH_DB=users-db

MONGO_EVENT_USER_ADMIN=event_mongo_admin
MONGO_EVENT_PASS_ADMIN=
MONGO_EVENT_USER=event_mongo_user
MONGO_EVENT_PASS=
MONGO_EVENT_DB=events-db

NODE_ENV=development

JWT_SECRET_BASE64=
JWT_EXPIRES_IN=3600s

```

#### docker-compose.yml
```
version: "3.8"

services:
  mongo_auth:
    image: mongo:8
    container_name: mongo_auth
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_AUTH_USER_ADMIN}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_AUTH_PASS_ADMIN}
      - MONGO_INITDB_DATABASE=${MONGO_AUTH_DB}
    volumes:
      - mongo_auth_data:/data/db
      - ./mongo_auth_init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

  mongo_event:
    image: mongo:8
    container_name: mongo_event
    ports:
      - "27018:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_EVENT_USER_ADMIN}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_EVENT_PASS_ADMIN}
      - MONGO_INITDB_DATABASE=${MONGO_EVENT_DB}
    volumes:
      - mongo_event_data:/data/db
      - ./mongo_events_init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "${REDIS_PORT}:6379"
    command: ["redis-server", "--requirepass", "${REDIS_PASSWORD}"]
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

  zookeeper:
    image: wurstmeister/zookeeper:latest
    container_name: zookeeper
    ports:
      - "2181:2181"

  kafka:
    image: wurstmeister/kafka:latest
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      - KAFKA_BROKER_ID=1
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=SASL_PLAINTEXT:SASL_PLAINTEXT
      - KAFKA_ADVERTISED_LISTENERS=SASL_PLAINTEXT://kafka:9092
      - KAFKA_LISTENERS=SASL_PLAINTEXT://0.0.0.0:9092
      - KAFKA_SASL_ENABLED_MECHANISMS=PLAIN
      - KAFKA_SASL_MECHANISM_INTER_BROKER_PROTOCOL=PLAIN
      - KAFKA_INTER_BROKER_LISTENER_NAME=SASL_PLAINTEXT
      - KAFKA_SUPER_USERS=User:admin
      - KAFKA_ZOOKEEPER_SASL_ENABLED=false
      - KAFKA_OPTS=-Djava.security.auth.login.config=/etc/kafka/jaas.conf -Dzookeeper.sasl.client=false
    volumes:
      - ./jaas.conf:/etc/kafka/jaas.conf:ro
    depends_on:
      - zookeeper

  gateway:
    build:
      context: ./gateway
      dockerfile: Dockerfile
    container_name: gateway
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - NODE_ENV=${NODE_ENV}
      - JWT_SECRET_BASE64=${JWT_SECRET_BASE64}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN}

      - AUTH_SERVICE_URL=http://auth:4000
      - EVENT_SERVICE_URL=http://event:4000
    depends_on:
      - auth
      - event

  auth:
    build:
      context: ./auth
      dockerfile: Dockerfile
    container_name: auth
    ports:
      - "4001:4000"
    environment:
      - PORT=4000
      - NODE_ENV=${NODE_ENV}
      - JWT_SECRET_BASE64=${JWT_SECRET_BASE64}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN}

      - EVENT_SERVICE_URL=http://event:4000
      - GATEWAY_SERVICE_URL=http://gateway:4000

      - MONGODB_HOST=mongo_auth
      - MONGODB_PORT=27017
      - MONGODB_DB=${MONGO_AUTH_DB}
      - MONGODB_USER=${MONGO_AUTH_USER}
      - MONGODB_PASS=${MONGO_AUTH_PASS}

      - KAFKA_BROKERS=${KAFKA_BROKERS}
      - KAFKA_CLIENT_ID=${AUTH_KAFKA_CLIENT_ID}
      - KAFKA_GROUP_ID=${AUTH_KAFKA_GROUP_ID}
      - KAFKA_SASL_USERNAME=${KAFKA_SASL_USERNAME}
      - KAFKA_SASL_PASSWORD=${KAFKA_SASL_PASSWORD}

      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    depends_on:
      - mongo_auth
      - kafka
      - redis

  event:
    build:
      context: ./event
      dockerfile: Dockerfile
    container_name: event
    ports:
      - "4002:4000"
    environment:
      - PORT=4000
      - NODE_ENV=${NODE_ENV}

      - AUTH_SERVICE_URL=http://auth:4000
      - GATEWAY_SERVICE_URL=http://gateway:4000

      - MONGODB_HOST=mongo_event
      - MONGODB_PORT=27017
      - MONGODB_DB=${MONGO_EVENT_DB}
      - MONGODB_USER=${MONGO_EVENT_USER}
      - MONGODB_PASS=${MONGO_EVENT_PASS}

      - KAFKA_BROKERS=${KAFKA_BROKERS}
      - KAFKA_CLIENT_ID=${EVENT_KAFKA_CLIENT_ID}
      - KAFKA_GROUP_ID=${EVENT_KAFKA_GROUP_ID}
      - KAFKA_SASL_USERNAME=${KAFKA_SASL_USERNAME}
      - KAFKA_SASL_PASSWORD=${KAFKA_SASL_PASSWORD}
    depends_on:
      - mongo_event
      - kafka

volumes:
  mongo_auth_data:
  mongo_event_data:
  redis_data:

```

#### 각 서비스 Dockerfile
```
FROM node:18.20.8

RUN npm install -g @nestjs/cli

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]

```

#### MongoDB init.js
```
# mongo_auth_init.js
db = db.getSiblingDB('users-db');

db.createUser({
  user: 'auth_mongo_user',
  pwd: '',
  roles: [{ role: 'readWrite', db: 'users-db' }],
});

# mongo_events_init.js
db = db.getSiblingDB('events-db');

db.createUser({
  user: 'event_mongo_user',
  pwd: '',
  roles: [{ role: 'readWrite', db: 'events-db' }],
});
```

#### Kafka jaas.conf
```
KafkaServer {
  org.apache.kafka.common.security.plain.PlainLoginModule required
  username="kafka_dev"
  password=""
  user_kafka_dev="";
};
```