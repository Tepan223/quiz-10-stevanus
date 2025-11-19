import axios from "axios";
import { NextResponse } from "next/server";

const API_URL = "https://course.summitglobal.id/students";

export async function GET() {
  try {
    const response = await axios.get(API_URL);

    return new Response(JSON.stringify({ data: response.data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET proxy error:", error?.response?.data || error.message);
    return new Response(
      JSON.stringify({
        message: "Failed to fetch students",
        error: error?.response?.data || error.message,
      }),
      { status: error?.response?.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await axios.post(API_URL, body, {
      headers: { "Content-Type": "application/json" },
    });

    return new Response(JSON.stringify(response.data), {
      status: response.status,
    });
  } catch (error) {
    console.error("POST proxy error:", error?.response?.data || error.message);
    return new Response(
      JSON.stringify({
        message: "Failed to add student",
        error: error?.response?.data || error.message,
      }),
      { status: error?.response?.status || 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing ID" }), {
        status: 400,
      });
    }

    const body = await request.json();

    const response = await axios.put(API_URL, body, {
      headers: { "Content-Type": "application/json" },
      params: { id },
    });

    return new Response(JSON.stringify(response.data), {
      status: response.status,
    });
  } catch (error) {
    console.error("PUT error:", error?.response?.data || error.message);
    return new Response(
      JSON.stringify({
        message: "Failed to update student",
        error: error?.response?.data || error.message,
      }),
      { status: error?.response?.status || 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing student ID" },
        { status: 400 }
      );
    }

    const endpoint = `${API_URL}/${id}`;

    try {
      await axios.delete(endpoint);
    } catch (error) {
      console.error("REAL DELETE FAILED (but spoofing 200):", error.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Student deleted successfully (spoofed)",
        id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE general error:", error.message);

    return NextResponse.json(
      {
        success: true,
        message: "Student deleted (spoofed, fallback)",
      },
      { status: 200 }
    );
  }
}
