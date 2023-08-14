import React from "react";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { communityTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";
import { fetchCommunityDetails } from "@/lib/actions/community.action";
import UserCard from "@/components/cards/UserCard";
const page = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();

  if (!user) return null;

  const communiyDetails = await fetchCommunityDetails(params.id);


  return (
    <section>
      <ProfileHeader
        accountId={communiyDetails?.id}
        authUserId={user.id}
        name={communiyDetails.name}
        username={communiyDetails.username}
        imageUrl={communiyDetails.image}
        bio={communiyDetails.bio}
        type="Community"
      />

      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {communityTabs.map((tab) => {
              return (
                <TabsTrigger key={tab.label} value={tab.value} className="tab">
                  <Image
                    src={tab.icon}
                    alt={tab.label}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <p className="max-sm:hidden">{tab.label}</p>
                  {tab.label === "Threads" && (
                    <p className="ml-1 rounded-sm bg-light-4 px-2 p-1 !text-tiny-medium text-light-2">
                      {communiyDetails?.threads.length}
                    </p>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <TabsContent value={"threads"} className="w-full text-light-1">
            <ThreadsTab
              currentUserId={user.id}
              accountId={communiyDetails._id}
              accountType="Community"
            />
          </TabsContent>
          <TabsContent value={"members"} className="w-full text-light-1">
            <section className="mt-9 flex flex-col gap-10">
              {communiyDetails?.members?.map((member: any) => {
                return (
                  <UserCard
                    key={member.id}
                    id={member.id}
                    name={member.name}
                    username={member.username}
                    imgUrl={member.image}
                    personType="User"
                  />
                );
              })}
            </section>
          </TabsContent>
          <TabsContent value={"requests"} className="w-full text-light-1">
            <ThreadsTab
              currentUserId={user.id}
              accountId={communiyDetails._id}
              accountType="Community"
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default page;
