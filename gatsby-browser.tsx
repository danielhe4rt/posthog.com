import React from 'react'
import { initKea, wrapElement } from './kea'
import './src/styles/global.css'
import HandbookLayout from './src/templates/Handbook'
import Job from './src/templates/Job'
import Posts from './src/components/Edition/Posts'
import { Provider as ToastProvider } from './src/context/toast'
import { RouteUpdateArgs } from 'gatsby'
import { UserProvider } from './src/hooks/useUser'
import { ChatProvider } from './src/hooks/useChat'

initKea(false)

export const wrapRootElement = ({ element }) => (
    <UserProvider>
        <ToastProvider>
            <ChatProvider>{wrapElement({ element })}</ChatProvider>
        </ToastProvider>
    </UserProvider>
)
export const onRouteUpdate = ({ location, prevLocation }: RouteUpdateArgs) => {
    // This is checked and set on initial load in the body script set in gatsby-ssr.js
    // Checking for prevLocation prevents this from happening twice
    if (typeof window !== 'undefined' && prevLocation) {
        var theme = (window as any).__theme

        document.body.className = theme
    }

    if (window?.posthog) {
        if (prevLocation) {
            window.posthog.capture('$pageleave', {
                $host: prevLocation.host,
                $pathname: prevLocation.pathname,
                $current_url: prevLocation.href,
            })
        }

        window?.posthog?.capture('$pageview')
    }
}
export const wrapPageElement = ({ element, props }) => {
    const slug = props.location.pathname.substring(1)
    return !/^posts\/new|^posts\/(.*)\/edit/.test(slug) &&
        (props.pageContext.post || /^posts|^changelog\/(.*?)\//.test(slug)) ? (
        <Posts {...props}>{element}</Posts>
    ) : props.custom404 || !props.data || props.pageContext.ignoreWrapper ? (
        element
    ) : /^handbook|^docs\/(?!api)|^manual/.test(slug) &&
      ![
          'docs/api/post-only-endpoints',
          'docs/api/user',
          'docs/integrations',
          'docs/product-analytics',
          'docs/session-replay',
          'docs/feature-flags',
          'docs/experiments',
          'docs/data',
      ].includes(slug) ? (
        <HandbookLayout {...props} />
    ) : /^session-replay|^product-analytics|^feature-flags|^experiments|^product-os/.test(slug) ? (
        <Product {...props} />
    ) : /^careers\//.test(slug) ? (
        <Job {...props} />
    ) : (
        element
    )
}
