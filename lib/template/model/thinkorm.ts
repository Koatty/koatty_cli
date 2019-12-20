/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-12-18 09:48:40
 */
import { BaseModel } from "thinkorm";
import { Component, Value } from 'koatty';

@Component()
export class <ClassName> extends BaseModel {
    @Value("database", "db")
    config: any;
    modelName: string;
    fields: any;

    /**
     * Custom constructor
     *
     */
    init() {
        // 模型名称
        this.modelName = '<ModelName>';
        // 数据表字段信息
        this.fields = {
            id: { //用户ID
                type: 'integer',
                pk: true,
                size: 11
            }
        };
    }
}