img=imread("810.jpg");
img=rgb2gray(img);
imgData=zeros(1,256);
[height,width]=size(img);
for i=1:height
    for j=1:width
        imgData(img(i,j)+1)=imgData(img(i,j)+1)+1;
    end
end
bar(imgData)
writelines("","./imgText.txt");
for i=1:height
    strArray="a";
    strArray=strrep(strArray,'a','"');
    limit=[70,145,175];
    for j=1:width
        if img(i,j)<limit(1)
            img(i,j)=0;
        elseif img(i,j)<limit(2)
            img(i,j)=1;
        elseif img(i,j)<limit(3)
            img(i,j)=2;
        else
            img(i,j)=3;
        end
        strArray=strArray+img(i,j)+",";
    end
    strArray=strip(strArray,"right",",")+'",';
    writelines(strArray,"./imgText.txt",WriteMode="append");
end
for i=1:height
    for j=1:width
        if img(i,j)==0
            img(i,j)=0;
        elseif img(i,j)==1
            img(i,j)=63;
        elseif img(i,j)==2
            img(i,j)=191;
        else
            img(i,j)=255;
        end
    end
end
imshow(img)