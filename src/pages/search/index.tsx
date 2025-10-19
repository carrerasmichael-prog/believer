import RightColumn from "@/shared/components/RightColumn.tsx"
import AlgorithmicFeed from "@/shared/components/feed/AlgorithmicFeed"
import Header from "@/shared/components/header/Header"
import {ScrollablePageContainer} from "@/shared/components/layout/ScrollablePageContainer"
import {useParams} from "@/navigation"
import Widget from "@/shared/components/ui/Widget"
import {Helmet} from "react-helmet"
import {useIsTwoColumnLayout} from "@/shared/hooks/useIsTwoColumnLayout"
import {HomeRightColumn} from "@/pages/home/components/HomeRightColumn"
import SearchFilters from "./components/SearchFilters"

function SearchPage() {
  const {query} = useParams()
  const decodedQuery = query ? decodeURIComponent(query) : ""
  const isInTwoColumnLayout = useIsTwoColumnLayout()

  // If in two-column layout, show the home-style right column
  if (isInTwoColumnLayout) {
    return <HomeRightColumn />
  }

  // Single column layout - show full interface
  return (
    <div className="flex flex-1 flex-row relative h-full">
      <div className="flex flex-col flex-1 h-full relative">
        <Header title={decodedQuery ? `Search: "${decodedQuery}"` : "Search"} />
        <ScrollablePageContainer className="flex flex-col items-center">
          <div className="flex-1 w-full flex flex-col gap-2 md:pt-2">
            <SearchFilters />
          </div>
          <Helmet>
            <title>{decodedQuery ? `Search: ${decodedQuery}` : `Search`} / Iris</title>
          </Helmet>
        </ScrollablePageContainer>
      </div>
      <RightColumn>
        {() => (
          <>
            <Widget title="Popular" className="h-96">
              <AlgorithmicFeed
                type="popular"
                displayOptions={{
                  small: true,
                  showDisplaySelector: false,
                }}
              />
            </Widget>
          </>
        )}
      </RightColumn>
    </div>
  )
}

export default SearchPage
