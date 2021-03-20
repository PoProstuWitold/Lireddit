import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { usePostsQuery } from '../generated/graphql'
import { NavBar } from '../components/NavBar'

const Index = () => {

    const [{data}] = usePostsQuery()

    return (
      <>
      <NavBar/>
      <div>Hello world</div>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
      </>
    )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
