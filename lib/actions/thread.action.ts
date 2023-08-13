"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectedToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectedToDB();
    const createNewThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // update user mdoel

    await User.findByIdAndUpdate(author, {
      $push: {
        threads: createNewThread._id,
      },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread :  ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectedToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    // fetch only top level threads  becuase comment also inculde in thread
    const postQuery = Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentIt image",
        },
      });

    const totalPostCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const posts = await postQuery.exec();

    const isNext = totalPostCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    throw new Error(`Error Fetching Posts :  ${error.message}`);
  }
}

export async function fetchThreadById(id: string) {
  try {
    connectedToDB();
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();
    return thread;
  } catch (error: any) {
    throw new Error(`Error Fetching Threads:  ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  try {
    connectedToDB();
    // find original thread by its od
    const thread = await Thread.findById(threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    // create a new thread with comment text

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });
    const saveCommentThread = await commentThread.save()

    // update the original thread to include the new thread 
    thread.children.push(saveCommentThread._id)

    // save the thread now 
    await thread.save();

    revalidatePath(path)

  } catch (error: any) {
    throw new Error(`Error while adding a thread:  ${error.message}`);
  }
}
