import { useNavigate } from "react-router-dom";
import Button from "../../component/Button";
import Table from "../../component/Table";
import { useWhos } from "../../hooks/useWhos";
import { getUserId } from "../../utils/getUserId";

const WhoPage = () => {
  const navigate = useNavigate();
  const userId = getUserId();

  const { data: whos = [], isLoading, isError } = useWhos(userId);

  if (isLoading) return <div className="mx-5 mt-5">로딩 중...</div>;
  if (isError)
    return <div className="mx-5 mt-5 text-red-500">데이터 불러오기 실패</div>;

  return (
    <div className="w-screen max-h-screen">
      <div className="mx-5 mt-5">
        <div className="grid grid-cols-5 gap-5">
          <Button
            text="함께한 사람 추가하기"
            onClick={() => navigate("add")}
            className="col-start-5"
          />
        </div>

        <Table
          className="text-left mt-5"
          tableTitles={
            <tr>
              <td>함께한 사람</td>
              <td />
            </tr>
          }
          bodyDatas={whos.map((who) => (
            <tr key={who.id}>
              <td>{who.name}</td>
              <td
                className="cursor-pointer text-right"
                onClick={() => navigate(`edit/${who.id}`)}
              >
                •••
              </td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
};

export default WhoPage;
