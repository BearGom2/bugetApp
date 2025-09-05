import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../component/Button";
import { getWhoById, updateWho, deleteWho } from "../../service/whoService";
import { toast } from "react-toastify";

const WhoEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const whoId = Number(id);

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWho = async () => {
      if (!whoId) return;

      try {
        const data = await getWhoById(whoId);
        setName(data.name);
      } catch (error) {
        console.error("이름 불러오기 실패:", error);
        toast.error("이름을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWho();
  }, [whoId]);

  const handleUpdate = async () => {
    if (!whoId || !name.trim()) {
      toast.warn("이름을 입력해주세요.");
      return;
    }

    try {
      await updateWho(whoId, name.trim());
      toast.success("수정 완료되었습니다.");
      navigate(-1);
    } catch (error) {
      console.error("수정 실패:", error);
      toast.error("수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!whoId) return;
    const confirm = window.confirm("정말 삭제하시겠습니까?");
    if (!confirm) return;

    try {
      await deleteWho(whoId);
      toast.success("삭제되었습니다.");
      navigate(-1);
    } catch (error) {
      console.error("삭제 실패:", error);
      toast.error("삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <p>불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="w-screen max-h-screen">
      <div className="mx-5 mt-5">
        <div className="grid grid-cols-5 gap-5">
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력"
          />
          <Button text="저장" onClick={handleUpdate} className="col-start-4" />
          <Button text="삭제" onClick={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default WhoEditPage;
