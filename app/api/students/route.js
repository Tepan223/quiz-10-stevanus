import axios from "axios";

const API_URL = "https://course.summitglobal.id/students";

export async function GET() {
  try {
    const response = await axios.get(API_URL);
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET proxy error:", error.response?.data || error.message);
    return new Response(
      JSON.stringify({
        message: "Failed to fetch students",
        error: error.response?.data || error.message,
      }),
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("POST body:", body);

    const response = await axios.post(API_URL, body, {
      headers: { "Content-Type": "application/json" },
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST proxy error:", error.response?.data || error.message);
    return new Response(
      JSON.stringify({
        message: "Failed to add student",
        error: error.response?.data || error.message,
      }),
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    const body = await request.json();

    const endpoints = [
      `${API_URL}/${id}`,
      `${API_URL}?id=${id}`,
    ];

    for (const endpoint of endpoints) {
      console.log(`🧩 Trying PUT ${endpoint}`);
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        const errText = await response.text();
        console.error(`PUT failed at ${endpoint}:`, errText);
      }
    }

    return new Response(
      JSON.stringify({ error: "Failed to update student" }),
      { status: 500 }
    );
  } catch (error) {
    console.error("PUT proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Server error during update" }),
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Missing student ID" }),
        { status: 400 }
      );
    }

    const endpoints = [
      `${API_URL}/${id}`,
      `${API_URL}?id=${id}`,
    ];

    let lastResponse = null;

    for (const endpoint of endpoints) {
      console.log(`🧪 Trying DELETE ${endpoint}`);
      const res = await fetch(endpoint, { method: "DELETE" });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const text = await res.text();
      console.error(`❌ DELETE failed at ${endpoint}:`, text);
      lastResponse = text;
    }

    return new Response(
      JSON.stringify({
        error: "Failed to delete student",
        details: lastResponse,
      }),
      { status: 500 }
    );
  } catch (error) {
    console.error("DELETE proxy crashed:", error.message);
    return new Response(
      JSON.stringify({ error: "Server error during delete" }),
      { status: 500 }
    );
  }
}
