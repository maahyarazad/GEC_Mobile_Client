import { Image } from "primereact/image";
import "./imageGrid.css";
import React, { FC } from "react";

interface Props {
  images: string[];
  columns?: number;
}

const ImageGrid: FC<Props> = ({ images, columns }) => {
  console.log('columns: ', columns);
  return (
    <div className="flex flex-row flex-wrap" style={{ columnGap: 2 }}>
      {images &&
        images.map((image, index) => (
          <div
            style={{
              width:
                columns && columns === 3 ?
                  "32.8%" : 
                  index === images.length - 1
                    ? (index + 1) % 2 === 0
                      ? "49.8%"
                      : "100%"
                    : "49.8%",
              aspectRatio: "1",
            }}
            key={index}
          >
            <Image
              src={image + "_s1.jpg"}
              className="w-full"
              style={{ aspectRatio: "1" }}
              imageStyle={{
                height: "100%",
                aspectRatio: "1",
                objectFit: "cover",
              }}
              alt="Image"
              preview
              onClick={(e) => {
                e.stopPropagation();
              }}
              key={image}
            />
          </div>
        ))}
    </div>
  );
};

export default ImageGrid;
