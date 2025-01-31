const CameraInfo = ({ selectedNote }) => {
    return (
      <div className="mt-4 p-4 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">
          {selectedNote ? selectedNote.location : "No camera selected"}
        </h2>
        {selectedNote ? <p>{selectedNote.note}</p> : <p>No camera selected</p>}
      </div>
    );
  };
  
  export default CameraInfo;
  