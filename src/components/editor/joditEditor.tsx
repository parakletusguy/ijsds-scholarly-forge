import JoditEditor from 'jodit-react'
import { useState, useRef, useMemo } from 'react'
import mammoth from 'mammoth'
import { X } from 'lucide-react'

export const TextEditor = ({html,editor,setEditor}) => {
    const editorRef = useRef(null)
    const [content,setContent] = useState(html)



    const config = {
        readonly: false,
        height: 400,
        toolbarButtonSize: 'middle' as const,
buttons: [
    // Editing controls group
    'undo', 'redo', '|',

    // Proofreading and error check group
    'spellcheck', 'copyformat', 'eraser', '|',

    // Text formatting group
    'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', '|',

    // Paragraph style group
    'paragraph', 'fontsize', 'font', 'brush', 'background', '|',

    // List and indentation group
    'ul', 'ol', 'outdent', 'indent', '|',

    // Alignment group
    'left', 'center', 'right', 'justify', '|',

    // Media and links group
    'image', 'file', 'video', 'link', 'unlink', '|',

    // Table and special inserts
    'table', 'hr', 'symbol', '|',
    
    // Utility group
    'source', 'selectall', 'print', 'fullsize', 'about'
  ],
        uploader: {
            insertImageAsBase64URI: true,
        },
    };

    return (
        <div className='w-[100vw] h-[100vh] top-[-25px] left-0 fixed flex justify-center items-center bg-[#000000b7]'>
            <p className='absolute top-[30px] right-[70px] text-white font-bold cursor-pointer' onClick={() => {setEditor(false)}}><X/></p>
            <div className='w-[60%]'>
                <JoditEditor
          ref={editorRef}
          value={content}
          config={config}
          tabIndex={1} // Optional: tabIndex for the textarea
          onBlur={(newContent) => setContent(newContent)} // Recommended for performance
          // onChange={(newContent) => {}} // Use onBlur for content updates to avoid focus issues
        />
            </div>
        </div>
    )
}
