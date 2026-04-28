// Editor.tsx (or Editor.jsx with TS comments)
import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef
} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// --------------------
// Add proper prop types
// --------------------
export interface EditorProps {
  readOnly?: boolean;
  htmlValue?: string;
  onTextChange?: (delta: any, oldDelta: any, source: any) => void;
  onSelectionChange?: (range: any, oldRange: any, source: any) => void;
}

// ------------------------
// Editor Component (typed)
// ------------------------
const Editor = forwardRef<any, EditorProps>(
  ({ readOnly = false, htmlValue = "", onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.enable?.(!readOnly);
      }
    }, [readOnly, ref]);

    // Init Quill
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      container.innerHTML = "";
      const editorContainer = document.createElement("div");
      container.appendChild(editorContainer);

      const quill = new Quill(editorContainer, {
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            ["link", "image", "video"],
            [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
            [{ direction: "rtl" }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
          ],
        },
        theme: "snow",
      });

      // Attach ref
      if (typeof ref !== "function" && ref) {
        ref.current = quill;
      }

      quill.on('text-change', (...args) =>
        onTextChangeRef.current?.(...args)
      );

      quill.on('selection-change', (...args) =>
        onSelectionChangeRef.current?.(...args)
      );

      return () => {
        if (typeof ref !== "function" && ref) ref.current = null;
        container.innerHTML = "";
      };
    }, [ref]);

    // Update editor HTML
    useEffect(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        if (htmlValue !== ref.current.root.innerHTML) {
          ref.current.clipboard.dangerouslyPasteHTML(htmlValue);
        }
      }
    }, [htmlValue, ref]);

    return <div ref={containerRef} dir="ltr" />;
  }
);

Editor.displayName = "Editor";

export default Editor;
