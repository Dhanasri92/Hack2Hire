import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(req: Request) {
  let body: any;
  try {
    const rawBody = await req.json();

    // 🧠 Check if payload is from Assistant Tool (has .message.toolCallList)
    if (rawBody?.message?.toolCallList?.[0]?.function?.arguments) {
      const args = JSON.parse(rawBody.message.toolCallList[0].function.arguments);
      body = args;
    } else {
      body = rawBody;
    }
  } catch (err) {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const { type, role, level, techstack, amount, userid } = body;

  if (!type || !role || !level || !techstack || !amount || !userid) {
    return Response.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    const { text: questionsText } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: `
        Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Respond ONLY with a JSON array of strings, no explanation or extra text.
        Format like this: ["Question 1", "Question 2", "Question 3"]
      `
    });

    let questions: string[] = [];
    try {
      questions = JSON.parse(questionsText);
      if (!Array.isArray(questions)) throw new Error("Questions not array");
    } catch (err) {
      return Response.json({ success: false, error: "Failed to parse AI response" }, { status: 500 });
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((tech: string) => tech.trim()),
      questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection("interviews").add(interview);

    return Response.json({ success: true, id: ref.id, questions }, { status: 200 });
  } catch (err) {
    return Response.json({ success: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
