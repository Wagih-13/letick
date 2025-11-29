"use client";

import React, { useState } from "react";
import { Link as LinkIcon, Loader2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ImageUploadInputProps = {
  folder: string;
  multiple?: boolean;
  onImagesAdded: (urls: string[]) => void;
  disabled?: boolean;
  className?: string;
};

export function ImageUploadInput({
  folder,
  multiple = false,
  onImagesAdded,
  disabled = false,
  className = "",
}: ImageUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInputs, setUrlInputs] = useState<string[]>([""]);
  const [activeTab, setActiveTab] = useState<string>("upload");

  async function onFilesSelected(fileList: FileList | File[]) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    try {
      setUploading(true);
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      fd.append("folder", folder);
      const up = await fetch(`/api/v1/uploads`, { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData?.error?.message || "Upload failed");
      const uploaded = (upData.data?.items || []).map((it: { url: string }) => it.url);
      if (uploaded.length) {
        onImagesAdded(uploaded);
        toast.success(`Uploaded ${uploaded.length} image${uploaded.length > 1 ? "s" : ""}`);
      }
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  function handleAddUrls() {
    const validUrls = urlInputs.map((u) => u.trim()).filter((u) => u.length > 0);

    if (validUrls.length === 0) {
      toast.error("Please enter at least one URL");
      return;
    }

    const invalidUrls = validUrls.filter((u) => !validateUrl(u));
    if (invalidUrls.length > 0) {
      toast.error(`Invalid URL${invalidUrls.length > 1 ? "s" : ""}: ${invalidUrls.join(", ")}`);
      return;
    }

    onImagesAdded(validUrls);
    toast.success(`Added ${validUrls.length} image${validUrls.length > 1 ? "s" : ""} from URL`);
    setUrlInputs([""]);
  }

  function addUrlInput() {
    setUrlInputs([...urlInputs, ""]);
  }

  function removeUrlInput(index: number) {
    setUrlInputs(urlInputs.filter((_, i) => i !== index));
  }

  function updateUrlInput(index: number, value: string) {
    const newInputs = [...urlInputs];
    if (newInputs[index] !== undefined) {
      newInputs[index] = value;
      setUrlInputs(newInputs);
    }
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload from Device
          </TabsTrigger>
          <TabsTrigger value="url">
            <LinkIcon className="mr-2 h-4 w-4" />
            Enter URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2">
              <input
                type="file"
                multiple={multiple}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => e.currentTarget.files && onFilesSelected(e.currentTarget.files)}
                disabled={disabled || uploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || uploading}
                onClick={(e) => {
                  const input = (e.currentTarget.previousSibling as HTMLInputElement) || null;
                  if (input) input.click();
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-1 h-4 w-4" /> Choose {multiple ? "Files" : "File"}
                  </>
                )}
              </Button>
            </label>
          </div>
          <div
            className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (disabled || uploading) return;
              const files = Array.from(e.dataTransfer.files || []);
              if (files.length) void onFilesSelected(files);
            }}
          >
            Drag and drop image{multiple ? "s" : ""} here or use the button above.
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <div className="space-y-2">
            {urlInputs.map((url, index) => (
              <div key={`url-input-${index}`} className="flex items-center gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => updateUrlInput(index, e.target.value)}
                  disabled={disabled}
                />
                {multiple && urlInputs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUrlInput(index)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {multiple && (
              <Button type="button" variant="outline" size="sm" onClick={addUrlInput} disabled={disabled}>
                <Plus className="mr-1 h-4 w-4" /> Add Another URL
              </Button>
            )}
            <Button type="button" variant="default" size="sm" onClick={handleAddUrls} disabled={disabled}>
              Add Image{multiple && urlInputs.length > 1 ? "s" : ""}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Enter {multiple ? "one or more image URLs" : "an image URL"}. URLs must start with http:// or https://
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
