import React from "react";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Upload, Button, Flex, Result } from "antd";
import { Typography } from "antd";
import { useState } from "react";
import { readExcel } from "./utils";

const { Title } = Typography;

const { Dragger } = Upload;

const ErrPage: React.FC = ({ subTitle, act }) => {
  return (
    <Result
      status="error"
      title="文件合并失败"
      subTitle={subTitle}
      extra={[
        <Button type="primary" onClick={act} key="act">
          继续合并
        </Button>,
      ]}
    />
  );
};

const OkPage: React.FC = ({ subTitle, act }) => {
  return (
    <Result
      status="success"
      title="文件合并成功"
      subTitle={`合并的文件已保存至 ${subTitle}。`}
      extra={[
        <Button type="primary" onClick={act} key="act">
          继续合并
        </Button>,
      ]}
    />
  );
};

const App: React.FC = () => {
  const [fileList, setFileList] = useState([]);
  const [merging, setMerging] = useState(false);
  const [resultPage, setResultPage] = useState("");
  const [subTitle, setSubTitle] = useState("");

  const noNeedMerge = fileList.length < 2;

  const back = () => {
    setFileList([]);
    setResultPage("");
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleMerge = () => {
    const promises = fileList.map((file) => readExcel(file.originFileObj));
    setMerging(true);
    Promise.all(promises)
      .then((results) => {
        window.electronAPI
          .saveExcel(results)
          .then((res) => {
            if (res.code === 0) {
              setResultPage("ok");
            } else {
              setResultPage("err");
            }
            setSubTitle(res.msg.toString());
          })
          .catch((err) => {
            setResultPage("err");
            setSubTitle(err.toString());
          });
      })
      .catch((err) => {
        setResultPage("err");
        setSubTitle(err.toString());
      })
      .finally(() => setMerging(false));
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    onChange: handleChange,
    beforeUpload: () => false,
    accept: ".xlsx, .xls",
  };

  if (resultPage == "ok") {
    return <OkPage act={back} subTitle={subTitle} />;
  }

  if (resultPage == "err") {
    return <ErrPage act={back} subTitle={subTitle} />;
  }

  return (
    <>
      <Title className="text-center">Excel 合并</Title>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          点击选择或者拖拽待合并文件列表至此区域
        </p>
      </Dragger>
      <Flex justify="center" className="mt-5">
        <Button
          type="primary"
          size="large"
          disabled={noNeedMerge || merging}
          onClick={handleMerge}
        >
          {merging ? "正在合并..." : "合并"}
        </Button>
      </Flex>
    </>
  );
};

export default App;
