"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { commentValidation } from "@/lib/validations/thread";
import { Button } from "../ui/button";
import * as z from "zod";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.action";

interface CommentProps {
  threadId: string;
  currentUserImage: string;
  currentUserId: string;
}

const Comment = ({
  threadId,
  currentUserImage,
  currentUserId,
}: CommentProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm<z.infer<typeof commentValidation>>({
    resolver: zodResolver(commentValidation),
    defaultValues: {
      thread: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof commentValidation>) => {
    await addCommentToThread(
      threadId,
      values.thread,
      JSON.parse(currentUserId),
      pathname
    );

    form.reset();
  };

  return (
    <Form {...form}>
      <form className="comment-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 w-full">
              <FormLabel>
                <Image
                  src={currentUserImage}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full object-contain"
                />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                  type="text"
                  placeholder="Comment..."
                  className="no-focus text-light-1 outline-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="comment-form_btn">
          Reply
        </Button>
      </form>
    </Form>
  );
};

export default Comment;
