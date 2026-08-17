ALTER TABLE "experiences" ADD COLUMN "published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "published" boolean DEFAULT true NOT NULL;