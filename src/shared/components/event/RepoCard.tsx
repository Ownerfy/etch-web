import StarOutline from "@mui/icons-material/StarOutline"
import {Chip, Badge} from "@mui/material"
import {Link} from "react-router-dom"

interface RepoCardProps {
  repo: string
  description?: string
}
const dummyDescription =
  "Scionic Merkle Trees contain small branches like Classic Merkle Trees, folder storage support like Merkle DAGs, and numbered leaves so anyone can sync by requesting a range of missing leaf numbers that correspond to missing file chunks. "

function RepoCard({repo, description}: RepoCardProps) {
  return (
    <Link
      className="card bg-base-100 cursor-pointer flex-1"
      to={`/repo/${repo?.toLowerCase()}`}
    >
      <div className="card-body py-8 flex flex-col gap-5">
        <div className="flex flex-row items-center justify-between ">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-3 items-center">
              <span className="font-bold text-2xl  gap-2 flex items-center">
                {repo}{" "}
                <span className="mr-2">
                  {" "}
                  <Chip
                    className="pr-2 flex items-center"
                    label="public"
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                </span>
              </span>
            </div>
          </div>
          <div className="btn btn-sm btn-neutral cursor-pointer">
            <StarOutline className="text-accent" /> Star{" "}
          </div>
        </div>
        <div>
          {" "}
          <span className="text-slate-400 text-sm">
            {" "}
            {description ? description : dummyDescription}
          </span>
        </div>
        <div className="flex flex-row gap-5">
          <div className="flex flex-row gap-5 items-center">
            <div className="flex flex row gap-3">
              <div className="flex flex-row gap-2 items-center">
                <Badge color="primary" variant="dot" />
                <small>typescript</small>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Badge color="primary" variant="dot" />
                <small>typescript</small>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Badge color="primary" variant="dot" />
                <small className="">typescript</small>
              </div>
            </div>
          </div>
          <small className="align-items-center flex text-slate-400">
            {" "}
            Last Updated on 8/21/2024
          </small>
        </div>
      </div>
    </Link>
  )
}

export default RepoCard
