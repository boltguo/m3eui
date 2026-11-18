import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { FileUpload } from "./FileUpload.js";

describe("FileUpload", () => {
  const dom = setupDomTest();

  it("renders file list and supports removing items", () => {
    let uploadItems = [
      { id: "f1", name: "spec.pdf", size: 204800, status: "uploading" as const, progress: 60 },
      { id: "f2", name: "tokens.json", size: 12400, status: "completed" as const },
    ];

    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <FileUpload
            defaultValue={uploadItems}
            onValueChange={(next) => {
              uploadItems = next as typeof uploadItems;
            }}
          />
        </PausedWrapper>,
      );
    });

    const fileList = dom.container.querySelector('.m3e-file-upload__list[role="list"]');
    expect(fileList?.querySelectorAll(".m3e-file-upload__item").length).toBe(2);
    const removeFileBtn = fileList?.querySelector<HTMLButtonElement>(
      ".m3e-file-upload__remove",
    );
    act(() => {
      removeFileBtn?.click();
    });
    expect(uploadItems.length).toBe(1);
  });

  it("replaces single file on multiple={false} and defaults to idle status", () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <FileUpload multiple={false} />
        </M3EProvider>,
      );
    });

    const fileInput = dom.container.querySelector<HTMLInputElement>(
      ".m3e-file-upload input[type='file']",
    )!;
    const f1 = new File(["alpha"], "a.txt", { type: "text/plain" });
    const f2 = new File(["beta"], "b.txt", { type: "text/plain" });

    act(() => {
      Object.defineProperty(fileInput, "files", {
        value: [f1],
        configurable: true,
      });
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(dom.container.querySelector(".m3e-file-upload")?.textContent).toContain("a.txt");
    expect(
      dom.container.querySelector(".m3e-file-upload__item")?.getAttribute("data-status"),
    ).toBe("idle");

    act(() => {
      Object.defineProperty(fileInput, "files", {
        value: [f2],
        configurable: true,
      });
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const uploadText = dom.container.querySelector(".m3e-file-upload")?.textContent ?? "";
    expect(uploadText).toContain("b.txt");
    expect(uploadText).not.toContain("a.txt");
  });
});
