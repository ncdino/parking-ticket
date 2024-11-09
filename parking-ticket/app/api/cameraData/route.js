import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { NextResponse } from "next/server";

export async function GET() {
  const csvFilePath = path.join(process.cwd(), "public", "data/camera_output.csv");

  try {
    // CSV 파일을 UTF-8로 읽기
    const fileData = fs.readFileSync(csvFilePath, "utf-8");

    // Papa.parse로 데이터를 파싱
    const parseData = Papa.parse(fileData, {
      header: true,
      skipEmptyLines: true,
    });

    console.log("파싱된 데이터:", parseData.data);

    return NextResponse.json(parseData.data);
  } catch (error) {
    console.error("CSV 파일을 읽을 수 없습니다.", error);
    return NextResponse.json(
      { error: "CSV 파일을 읽을 수 없습니다." },
      { status: 500 }
    );
  }
}
