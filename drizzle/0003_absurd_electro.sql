CREATE TABLE "book_genre" (
	"book_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	CONSTRAINT "book_genre_book_id_genre_id_pk" PRIMARY KEY("book_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "genre_value_unique" UNIQUE("value")
);
--> statement-breakpoint
ALTER TABLE "book_genre" ADD CONSTRAINT "book_genre_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_genre" ADD CONSTRAINT "book_genre_genre_id_genre_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genre"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_genre_book_id_idx" ON "book_genre" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_genre_genre_id_idx" ON "book_genre" USING btree ("genre_id");--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN "genres";