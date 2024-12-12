CREATE TYPE "public"."title_event" AS ENUM('availability', 'appointment');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"cpf" text NOT NULL,
	"phone" text NOT NULL,
	"description" text,
	"provider_id" text NOT NULL,
	"event_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth-codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"provider_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "auth-codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" "title_event" NOT NULL,
	"start_time" timestamp (3) with time zone NOT NULL,
	"end_time" timestamp (3) with time zone NOT NULL,
	"start_timezone" text NOT NULL,
	"end_timezone" text NOT NULL,
	"recurrence_rule" text,
	"recurrence_exception" text,
	"recurrence_id" text,
	"provider_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "providers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"cpf" text NOT NULL,
	"password" text NOT NULL,
	"phone" text NOT NULL,
	"duration" integer NOT NULL,
	"birthday" timestamp (3) with time zone NOT NULL,
	"specialty" text NOT NULL,
	"price" integer NOT NULL,
	"education" text,
	"description" text,
	CONSTRAINT "providers_email_unique" UNIQUE("email"),
	CONSTRAINT "providers_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointments" ADD CONSTRAINT "appointments_event_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth-codes" ADD CONSTRAINT "auth-codes_provider_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_provider_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_event_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
