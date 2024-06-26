import { useEffect, useState} from 'react'
import { usePlausible } from 'next-plausible'
import { useRouter } from 'next/router'
import { useStorage } from '../hooks/useLocalStorage'

import { arrowIcon } from '../assets/icons'

type SearchInputProps = {
  size: 'lg' | undefined
}

export type SearchQuery = {
  text: string
  username: string
  advanced: boolean
}

export default function SearchInput({ size, ...props }: SearchInputProps) {
  const router = useRouter()
  const plausible = usePlausible()
  const { getItem, setItem } = useStorage()
  // const [mounted, setMounted] = useState<boolean>(false)
  const [basicText, setBasicText] = useState<string>('')
  // const [isAdvanced, setIsAdvanced] = useState<boolean>(false)
  const [sessionQuery, setSessionQuery] = useState<SearchQuery | undefined>()

  useEffect(() => {
    const searchSession = getItem('search-query', 'session')
    if (searchSession) {
      const _sessionQuery: SearchQuery = JSON.parse(searchSession)
      // setIsAdvanced(_sessionQuery.advanced)
      setBasicText(_sessionQuery.text)
      setSessionQuery(_sessionQuery)
    } else {
      const searchParams = router.query as unknown as SearchQuery
      setSessionQuery(searchParams)
      // setIsAdvanced(searchParams.username !== undefined)
    }
    // setMounted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  
  function handleFormSubmit(e: any) {
    e.preventDefault()
    let query: SearchQuery = {
      text: e.target!.text?.value,
      username: e.target!.username?.value,
      advanced: false,
    }
    // if a query is only `from:username` or `from: username` or `from: @username`, redirect to /search?username=username
    // if a query includes a search query *and* `(from:username)` or `(from: username)` or `(from: @username)`, redirect to /search?username=username&text=text
    const fromAndText =
      query.text.match(/^(.+)\s(from:\s?@?(\w+))$/i) ||
      query.text.match(/^(.+)\s\((from:\s?@?(\w+))\)$/i)

    if (fromAndText) {
      query.text = fromAndText[1]
      query.username = fromAndText[3]
      query.advanced = false
    }
    const searchParams = new URLSearchParams()
    if (query.text) searchParams.set('text', query.text)
    if (query.username) searchParams.set('username', query.username)

    // Save query to session storage
    setItem('search-query', JSON.stringify(query), 'session')

    plausible('Search', {
      props: {
        text: query.text === '' ? null : query.text,
        username: query.username === '' ? null : query.username,
      },
    })
    // console.log('searchparam' , searchParams.toString())
    // router.push(`/search?${searchParams.toString()}`)
    // const fetchedData = await (await fetch(`https://searchcaster.xyz/api/search?${searchParams.toString()}`)).json()
    // setData(fetchedData)
    router.push(`/search?${searchParams.toString()}`)
  }

  return (
    <>
      <form onSubmit={(e) => handleFormSubmit(e)} {...props}>
          <div className="input-wrapper">
            <input
              type="text"
              name="text"
              defaultValue={sessionQuery?.text || ''}
              onChange={(e) => setBasicText(e.target.value)}
            />
            <button type="submit">{arrowIcon}</button>
          </div>
      </form>

      <style jsx>{`
        .input-wrapper {
          display: flex;
          background-color: #4d4063;
          border-radius: 2.5rem;
          justify-content: space-between;
          border: 1px solid #6f6581;
          position: relative;
          padding-right: 2.25rem;
          overflow: hidden;

          input {
            background: transparent;
            color: #eee4ff;
            outline: none;
            font-size: ${size === 'lg' ? '1.25rem' : '1rem'};
            padding: 0.25rem 1rem;

            &::placeholder {
              color: #eee4ff;
              opacity: 0.4;
            }
          }

          button {
            --size: 2.5rem;

            position: absolute;
            width: fit-content;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: var(--size);
            height: var(--size);
            padding: 0.5rem;
            line-height: 0;
            border-radius: 5rem;
            opacity: 1;
            transition: opacity 0.1s ease-in-out;

            &:hover,
            &:focus-visible {
              opacity: 0.85;
            }
          }
        }

        .advanced-toggle {
          display: flex;
          gap: 0.5rem;
          width: 100%;
          justify-content: center;
          align-items: center;
          padding-top: 0.75rem;
          color: #9285ab;

          &--inner {
            padding-top: 0.5rem;
            width: fit-content;
            justify-content: flex-end;
            position: absolute;
            top: 2.75rem;
            right: 1.5rem;

            @media (max-width: 400px) {
              transform: scale(0.8);
              transform-origin: bottom right;
            }
          }

          &:hover {
            cursor: pointer;
          }
        }

        .advanced-search {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          background-color: #413656;

          @media (max-width: 768px) {
            gap: 0.5rem;
          }

          &__group {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 4fr;
            gap: 1rem;
            align-items: center;
            justify-content: space-between;

            @media (max-width: 768px) {
              display: flex;
              flex-direction: column;
              gap: 0.25rem;
              align-items: flex-start;
            }

            input {
              background-color: #fff;
              border: 1px solid #6f6581;
              box-shadow: 1px 1px 4px rgba(90, 70, 128, 0.5);
              border-radius: 0.375rem;
              padding: 0.375rem 0.5rem;
              color: #0b0b0c;
              width: 100%;
              max-width: 100%;

              &:focus-visible {
                outline: solid var(--primary-color);
              }
            }
          }

          &__submit {
            background-color: var(--primary-color);
            border-radius: 0.25rem;
            transition: background-color 0.1s ease-in-out;

            @media (max-width: 768px) {
              margin-top: 0.5rem;
            }

            &:hover {
              background-color: var(--primary-color-hover);
            }

            &:focus-visible {
              background-color: var(--primary-color-hover);
              outline: solid var(--primary-color-light);
            }
          }
        }
      `}</style>
    </>
  )
}
