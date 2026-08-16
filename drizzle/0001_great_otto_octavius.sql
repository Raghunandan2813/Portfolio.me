CREATE TABLE "experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"monogram" text DEFAULT '' NOT NULL,
	"logo_url" text,
	"linkedin_url" text,
	"date" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"current" boolean DEFAULT false NOT NULL,
	"description" text,
	"points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
