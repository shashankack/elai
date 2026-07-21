import Hero from "@/components/Hero";
import Section2 from "@/components/Section2";
import Section3 from "@/components/Section3";
import Section4 from "@/components/Section4";
import Section5 from "@/components/Section5";
import Section6 from "@/components/Section6";
import Section7 from "@/components/Section7";
import { listStoreCategories } from "@/lib/mercur/categories";
import { buildCategoryCards } from "@/lib/category-presentation";

export default async function Home() {
  const categories = buildCategoryCards(await listStoreCategories());

  return (
    <>
      <Hero />
      <Section3 />
      <Section2 categories={categories} />
      <Section4 />
      <Section5 />
      <Section6 categories={categories} />
      <Section7 />
    </>
  );
}
