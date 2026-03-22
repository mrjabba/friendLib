CREATE TABLE "book" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"pages" integer NOT NULL,
	"genres" text NOT NULL,
	"isbn13" bigint NOT NULL
);
