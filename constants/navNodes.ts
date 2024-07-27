export class NavNode {
  protected name?: string;
  protected path?: string;
  protected parent?: NavNode;
  protected childrenList: NavNode[];

  constructor(
    name: string | undefined = undefined,
    path: string | undefined = undefined,
    parent: NavNode | undefined = undefined,
  ) {
    this.name = name;
    this.path = path;
    this.parent = parent;
    this.childrenList = [];
  }

  public addPeer(node: NavNode): NavNode {
    this.parent?.addChildren(node);
    return this;
  }

  public addChildren(node: NavNode): NavNode {
    node.parent = this;
    this.childrenList.push(node);
    return this;
  }

  public getName(): string | undefined {
    return this.name;
  }

  public getPath(): string | undefined {
    return this.path;
  }

  public getParent(): NavNode | undefined {
    return this.parent;
  }

  public getChildrenList(): NavNode[] {
    return this.childrenList;
  }

  public getChainList(): NavNode[] {
    if (this.parent !== undefined) {
      const list = this.parent.getChainList();
      list.push(this);
      return list;
    }
    return [this];
  }

  public search(path: string): NavNode | undefined {
    if (this.path === path)
      return this;
    for (let i = 0; i < this.childrenList.length; i++) {
      const result = this.childrenList[i].search(path);
      if (result !== undefined)
        return result;
    }
    return undefined;
  }
}

export const adminNavNodes = new NavNode()
  .addChildren(new NavNode('管理首页', '/admin'))
  .addChildren(new NavNode('批改论文', '/admin/scoring'))
  .addChildren(new NavNode('班级管理', '/admin/class/list'))
  .addChildren(new NavNode('学生管理', '/admin/user/list'))
  .addChildren(new NavNode('数据管理')
    .addChildren(new NavNode('换届管理')
      .addChildren(new NavNode('删除班级', '/admin/class/delete'))
      .addChildren(new NavNode('导入学生数据', '/admin/import'))
      .addChildren(new NavNode('导入记录', '/admin/import/history')))
    .addChildren(new NavNode('创建')
      .addChildren(new NavNode('创建账户', '/admin/user/create'))
      .addChildren(new NavNode('创建班级', '/admin/class/create'))
      .addChildren(new NavNode('创建论文', '/admin/paper/create'))),
  )
  .addChildren(new NavNode('登录希悦', '/admin/seiue/login'));

export function useBreadcrumb() {
  const route = useRoute();
  const current = adminNavNodes.search(route.path);
  return current;
}
