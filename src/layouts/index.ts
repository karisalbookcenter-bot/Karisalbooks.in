/**
 * Barrel export for structural layout wrappers.
 * Import from "@/layouts" rather than reaching into individual files.
 *
 * Note: this folder is distinct from the existing `src/components/layout/`
 * (Header, Footer, MainLayout from Day 1), which is left untouched. These
 * are lower-level structural primitives (page/section/container shells);
 * `components/layout/*` composes them with real header/footer content.
 */
export * from "./PageWrapper";
export * from "./SectionWrapper";
export * from "./ContentContainer";
