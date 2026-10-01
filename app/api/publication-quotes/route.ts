import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MANUSCRIPT_TYPES: Record<string, string> = {
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
};
const COVER_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
};

function isAcceptedFile(file: File, types: Record<string, string>) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return Boolean(types[extension] && types[extension] === file.type && file.size > 0 && file.size <= MAX_FILE_BYTES);
}

export async function POST(request: Request) {
  const uploadedPaths: string[] = [];
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const phone = String(form.get("phone") ?? "").trim();
    const bookTitle = String(form.get("bookTitle") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const estimatedPages = Number(form.get("estimatedPages"));
    const printQuantity = Number(form.get("printQuantity"));
    const trimSize = String(form.get("trimSize") ?? "").trim();
    const printType = String(form.get("printType") ?? "").trim();
    const bindingType = String(form.get("bindingType") ?? "").trim();
    const manuscript = form.get("manuscript");
    const cover = form.get("cover");

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !bookTitle || description.length < 30 || description.length > 5000 || !Number.isInteger(estimatedPages) || estimatedPages < 1 || estimatedPages > 5000 || !Number.isInteger(printQuantity) || printQuantity < 1 || printQuantity > 100000 || !trimSize || !["black-white", "colour"].includes(printType) || !["paperback", "hardcover"].includes(bindingType)) {
      return NextResponse.json({ error: "Complete all required details. The project description must be at least 30 characters." }, { status: 400 });
    }
    if (!(manuscript instanceof File) || !isAcceptedFile(manuscript, MANUSCRIPT_TYPES)) {
      return NextResponse.json({ error: "Upload a DOC, DOCX, or PDF manuscript smaller than 20 MB." }, { status: 400 });
    }
    if (!(cover instanceof File) || !isAcceptedFile(cover, COVER_TYPES)) {
      return NextResponse.json({ error: "Upload a JPG, JPEG, or PDF cover file smaller than 20 MB." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const requestFolder = crypto.randomUUID();
    const manuscriptPath = `${requestFolder}/manuscript.${manuscript.name.split(".").pop()!.toLowerCase()}`;
    const coverPath = `${requestFolder}/cover.${cover.name.split(".").pop()!.toLowerCase()}`;
    const bucket = supabase.storage.from("publication-submissions");

    const { error: manuscriptError } = await bucket.upload(manuscriptPath, new Uint8Array(await manuscript.arrayBuffer()), { contentType: manuscript.type, upsert: false });
    if (manuscriptError) throw new Error(manuscriptError.message);
    uploadedPaths.push(manuscriptPath);
    const { error: coverError } = await bucket.upload(coverPath, new Uint8Array(await cover.arrayBuffer()), { contentType: cover.type, upsert: false });
    if (coverError) throw new Error(coverError.message);
    uploadedPaths.push(coverPath);

    const { data, error } = await supabase
      .from("publication_quote_requests")
      .insert({
        name,
        email,
        phone,
        book_title: bookTitle,
        description,
        estimated_pages: estimatedPages,
        print_quantity: printQuantity,
        trim_size: trimSize,
        print_type: printType,
        binding_type: bindingType,
        manuscript_path: manuscriptPath,
        cover_path: coverPath,
      })
      .select("request_number")
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, requestNumber: data.request_number }, { status: 201 });
  } catch (error) {
    if (uploadedPaths.length) {
      try {
        const supabase = createAdminClient();
        await supabase.storage.from("publication-submissions").remove(uploadedPaths);
      } catch {
        console.error("Unable to clean up incomplete publication submission uploads.");
      }
    }
    const message = error instanceof Error ? error.message : "Unable to submit your quotation request.";
    const status = message.includes("SUPABASE_SERVICE_ROLE_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}