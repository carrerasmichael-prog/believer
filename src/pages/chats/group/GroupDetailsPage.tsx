import {UserRow} from "@/shared/components/user/UserRow"
import {useParams} from "@/navigation"
import {useGroupsStore} from "@/stores/groups"
import Header from "@/shared/components/header/Header"
import {shouldHideUser} from "@/utils/visibility"

const GroupDetailsPage = () => {
  const params = useParams()
  const id = params.id || ""
  const {groups} = useGroupsStore()
  const group = id ? groups[id] : undefined

  if (!id || !group) {
    return <div className="p-4">Group not found</div>
  }

  return (
    <>
      <Header showBack />
      <div className="p-4 border-b border-base-300 text-center bg-base-100">
        <h1 className="text-2xl font-bold">Group Details</h1>
      </div>
      <div className="w-full mx-auto p-6 text-left pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))] md:pt-6 md:pb-6">
        <div className="flex items-center gap-4 mb-6">
          {group.picture ? (
            <img src={group.picture} alt="Group" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          )}
          <div>
            <div className="text-2xl font-bold">{group.name}</div>
            <div className="text-base-content/70 mt-1">{group.description}</div>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-4">Members</div>
          <ul className="space-y-4">
            {group.members
              .filter((pubkey) => !shouldHideUser(pubkey))
              .map((pubkey) => (
                <li key={pubkey}>
                  <UserRow pubKey={pubkey} avatarWidth={32} />
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default GroupDetailsPage
